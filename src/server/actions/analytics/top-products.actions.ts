"use server";

import { db } from "@/lib/db/db";
import { AppProduct } from "@/lib/db/tables/product/appProduct.table";
import { AppOrder } from "@/lib/db/tables/order/appOrder.table";
import { OrderItem } from "@/lib/db/tables/order/orderItem.table";
import { eq, and, gte, sql, desc } from "drizzle-orm";

export interface TopProductData {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  imageUrl: string;
}

export interface TopProductsStats {
  totalProducts: number;
  totalQuantitySold: number;
  topProductName: string;
  topProductPercentage: number;
}

export async function getTopSellingProductsData(
  storeId: string,
  limit: number = 10,
): Promise<TopProductData[]> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query to get top selling products this month
    const result = await db
      .select({
        productId: AppProduct.id,
        productName: AppProduct.name,
        totalQuantitySold: sql<number>`COALESCE(SUM(${OrderItem.quantity}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${OrderItem.total_price} AS DECIMAL)), 0)`,
        imageUrl: sql<string>`COALESCE(
          (${AppProduct.image_urls}->0)::text, 
          ''
        )`,
      })
      .from(OrderItem)
      .innerJoin(AppProduct, eq(OrderItem.productId, AppProduct.id))
      .innerJoin(AppOrder, eq(OrderItem.orderId, AppOrder.id))
      .where(
        and(
          eq(AppProduct.storeId, storeId),
          eq(AppOrder.storeId, storeId),
          gte(AppOrder.created_at, firstDayOfMonth),
        ),
      )
      .groupBy(AppProduct.id, AppProduct.name)
      .orderBy(desc(sql`SUM(${OrderItem.quantity})`))
      .limit(limit);

    return result.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantitySold: item.totalQuantitySold,
      totalRevenue: item.totalRevenue,
      imageUrl: item.imageUrl?.replace(/"/g, "") || "", // Remove quotes from JSON string
    }));
  } catch (error) {
    console.error("Error fetching top selling products data:", error);
    return [];
  }
}

export async function getTopProductsStats(
  storeId: string,
): Promise<TopProductsStats> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total stats for this month
    const totalStats = await db
      .select({
        totalProducts: sql<number>`COUNT(DISTINCT ${AppProduct.id})`,
        totalQuantitySold: sql<number>`COALESCE(SUM(${OrderItem.quantity}), 0)`,
      })
      .from(OrderItem)
      .innerJoin(AppProduct, eq(OrderItem.productId, AppProduct.id))
      .innerJoin(AppOrder, eq(OrderItem.orderId, AppOrder.id))
      .where(
        and(
          eq(AppProduct.storeId, storeId),
          eq(AppOrder.storeId, storeId),
          gte(AppOrder.created_at, firstDayOfMonth),
        ),
      );

    // Get top selling product for percentage calculation
    const topProduct = await db
      .select({
        productName: AppProduct.name,
        quantitySold: sql<number>`SUM(${OrderItem.quantity})`,
      })
      .from(OrderItem)
      .innerJoin(AppProduct, eq(OrderItem.productId, AppProduct.id))
      .innerJoin(AppOrder, eq(OrderItem.orderId, AppOrder.id))
      .where(
        and(
          eq(AppProduct.storeId, storeId),
          eq(AppOrder.storeId, storeId),
          gte(AppOrder.created_at, firstDayOfMonth),
        ),
      )
      .groupBy(AppProduct.id, AppProduct.name)
      .orderBy(desc(sql`SUM(${OrderItem.quantity})`))
      .limit(1);

    const stats = totalStats[0] || { totalProducts: 0, totalQuantitySold: 0 };
    const top = topProduct[0] || { productName: "N/A", quantitySold: 0 };

    const topProductPercentage =
      stats.totalQuantitySold > 0
        ? (top.quantitySold / stats.totalQuantitySold) * 100
        : 0;

    return {
      totalProducts: stats.totalProducts,
      totalQuantitySold: stats.totalQuantitySold,
      topProductName: top.productName,
      topProductPercentage,
    };
  } catch (error) {
    console.error("Error fetching top products stats:", error);
    return {
      totalProducts: 0,
      totalQuantitySold: 0,
      topProductName: "N/A",
      topProductPercentage: 0,
    };
  }
}
