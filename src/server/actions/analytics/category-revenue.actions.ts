"use server";

import { db } from "@/lib/db/db";
import { AppPayment } from "@/lib/db/tables/order/appPayment.table";
import { AppOrder } from "@/lib/db/tables/order/appOrder.table";
import { OrderItem } from "@/lib/db/tables/order/orderItem.table";
import { AppProduct, AppCategory } from "@/lib/db/tables/product";
import { eq, and, sql } from "drizzle-orm";

export interface CategoryRevenueData {
  category: string;
  revenue: number;
  percentage: number;
  color: string;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export async function getCategoryRevenueData(
  storeId: string,
): Promise<CategoryRevenueData[]> {
  try {
    // Get revenue by category with joins through OrderItem
    const result = await db
      .select({
        categoryName: AppCategory.name,
        categoryId: AppCategory.id,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${AppPayment.amount} AS DECIMAL)), 0)`,
      })
      .from(AppPayment)
      .innerJoin(AppOrder, eq(AppPayment.order_id, AppOrder.id))
      .innerJoin(OrderItem, eq(AppOrder.id, OrderItem.orderId))
      .innerJoin(AppProduct, eq(OrderItem.productId, AppProduct.id))
      .innerJoin(AppCategory, eq(AppProduct.categoryId, AppCategory.id))
      .where(
        and(
          eq(AppPayment.storeId, storeId),
          eq(AppPayment.status, "succeeded"),
          eq(AppOrder.storeId, storeId),
          eq(AppProduct.storeId, storeId),
          eq(AppCategory.storeId, storeId),
        ),
      )
      .groupBy(AppCategory.id, AppCategory.name)
      .orderBy(sql`SUM(CAST(${AppPayment.amount} AS DECIMAL)) DESC`);

    // Calculate total revenue for percentages
    const totalRevenue = result.reduce(
      (sum, item) => sum + Number(item.totalRevenue),
      0,
    );

    if (totalRevenue === 0) {
      return [
        {
          category: "No Data",
          revenue: 0,
          percentage: 100,
          color: CHART_COLORS[0],
        },
      ];
    }

    // Format data and limit to top 5 categories, group others
    let formattedData: CategoryRevenueData[] = result
      .slice(0, 4) // Take top 4 categories
      .map((item, index) => ({
        category: item.categoryName || "Unknown",
        revenue: Number(item.totalRevenue),
        percentage: (Number(item.totalRevenue) / totalRevenue) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    // Group remaining categories as "Other" if there are more than 4
    if (result.length > 4) {
      const otherRevenue = result
        .slice(4)
        .reduce((sum, item) => sum + Number(item.totalRevenue), 0);

      if (otherRevenue > 0) {
        formattedData = [
          ...formattedData,
          {
            category: "Other",
            revenue: otherRevenue,
            percentage: (otherRevenue / totalRevenue) * 100,
            color: CHART_COLORS[4],
          },
        ];
      }
    }

    return formattedData;
  } catch (error) {
    console.error("Error fetching category revenue data:", error);
    throw new Error("Failed to fetch category revenue data");
  }
}

export async function getCategoryRevenueStats(storeId: string): Promise<{
  totalRevenue: number;
  topCategory: string;
  topCategoryPercentage: number;
}> {
  try {
    const categoryData = await getCategoryRevenueData(storeId);

    const totalRevenue = categoryData.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const topCategory = categoryData[0];

    return {
      totalRevenue,
      topCategory: topCategory?.category || "No Data",
      topCategoryPercentage: topCategory?.percentage || 0,
    };
  } catch (error) {
    console.error("Error fetching category revenue stats:", error);
    throw new Error("Failed to fetch category revenue stats");
  }
}
