"use server";

import { db } from "@/lib/db/db";
import { AppPayment } from "@/lib/db/tables/order/appPayment.table";
import { eq, and, gte, sql } from "drizzle-orm";

export type RevenuePeriod = "daily" | "weekly" | "monthly";

export interface RevenueData {
  period: string;
  revenue: number;
}

export async function getRevenueData(
  storeId: string,
  period: RevenuePeriod = "monthly",
): Promise<RevenueData[]> {
  try {
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    // Calculate date range and grouping based on period
    switch (period) {
      case "daily":
        // Show today's hourly data (00:00 to 23:59 of current day)
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        groupByFormat = "EXTRACT(HOUR FROM created_at)";
        break;
      case "weekly":
        // Show last 7 days
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 6,
        );
        groupByFormat = "DATE_TRUNC('day', created_at)";
        break;
      case "monthly":
      default:
        // Show all days of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupByFormat = "EXTRACT(DAY FROM created_at)";
        break;
    }

    // Query payments data grouped by period
    const result = await db
      .select({
        period: sql<string>`${sql.raw(groupByFormat)}`,
        revenue: sql<number>`COALESCE(SUM(CAST(${AppPayment.amount} AS DECIMAL)), 0)`,
      })
      .from(AppPayment)
      .where(
        and(
          eq(AppPayment.storeId, storeId),
          eq(AppPayment.status, "succeeded"),
          gte(AppPayment.created_at, startDate),
        ),
      )
      .groupBy(sql.raw(groupByFormat))
      .orderBy(sql.raw(groupByFormat));

    // Format the result for display
    const formattedData: RevenueData[] = result.map((row) => ({
      period: formatPeriodLabel(row.period, period),
      revenue: Number(row.revenue) || 0,
    }));

    // Fill missing periods with zero values to ensure complete time series
    return fillMissingPeriods(formattedData, period, startDate, now);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    throw new Error("Failed to fetch revenue data");
  }
}

function formatPeriodLabel(period: string, type: RevenuePeriod): string {
  switch (type) {
    case "daily":
      // period is hour number (0-23)
      const hour = parseInt(period);
      return `${hour.toString().padStart(2, "0")}:00`;
    case "weekly":
      // period is a date string from DATE_TRUNC
      const date = new Date(period);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "monthly":
      // period is day number (1-31)
      const day = parseInt(period);
      return `Day ${day}`;
    default:
      return period;
  }
}

function fillMissingPeriods(
  data: RevenueData[],
  period: RevenuePeriod,
  startDate: Date,
  endDate: Date,
): RevenueData[] {
  const filledData: RevenueData[] = [];
  const dataMap = new Map(data.map((item) => [item.period, item.revenue]));

  switch (period) {
    case "daily":
      // Fill all 24 hours (0-23)
      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
        filledData.push({
          period: hourLabel,
          revenue: dataMap.get(hourLabel) || 0,
        });
      }
      break;

    case "weekly":
      // Fill last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateLabel = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        filledData.push({
          period: dateLabel,
          revenue: dataMap.get(dateLabel) || 0,
        });
      }
      break;

    case "monthly":
      // Fill all days of current month
      const daysInMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        0,
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayLabel = `Day ${day}`;
        filledData.push({
          period: dayLabel,
          revenue: dataMap.get(dayLabel) || 0,
        });
      }
      break;
  }

  return filledData;
}

export async function getRevenueStats(
  storeId: string,
  period: RevenuePeriod = "monthly",
): Promise<{
  totalRevenue: number;
  growth: number;
  growthPeriod: string;
}> {
  try {
    const now = new Date();

    // Get total revenue
    const totalResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${AppPayment.amount} AS DECIMAL)), 0)`,
      })
      .from(AppPayment)
      .where(
        and(
          eq(AppPayment.storeId, storeId),
          eq(AppPayment.status, "succeeded"),
        ),
      );

    let current = 0;
    let previous = 0;
    let growthPeriod = "";

    // Calculate growth based on the selected period
    switch (period) {
      case "daily": {
        // Compare today vs yesterday
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dailyResult = await db
          .select({
            today: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${today} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
            yesterday: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${yesterday} AND ${AppPayment.created_at} < ${today} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
          })
          .from(AppPayment)
          .where(
            and(
              eq(AppPayment.storeId, storeId),
              eq(AppPayment.status, "succeeded"),
            ),
          );

        current = Number(dailyResult[0]?.today) || 0;
        previous = Number(dailyResult[0]?.yesterday) || 0;
        growthPeriod = "today";
        break;
      }

      case "weekly": {
        // Compare this week vs last week
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const weeklyResult = await db
          .select({
            thisWeek: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${oneWeekAgo} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
            lastWeek: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${twoWeeksAgo} AND ${AppPayment.created_at} < ${oneWeekAgo} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
          })
          .from(AppPayment)
          .where(
            and(
              eq(AppPayment.storeId, storeId),
              eq(AppPayment.status, "succeeded"),
            ),
          );

        current = Number(weeklyResult[0]?.thisWeek) || 0;
        previous = Number(weeklyResult[0]?.lastWeek) || 0;
        growthPeriod = "this week";
        break;
      }

      case "monthly":
      default: {
        // Compare this month vs last month
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const monthlyResult = await db
          .select({
            thisMonth: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${thisMonth} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
            lastMonth: sql<number>`COALESCE(SUM(CASE WHEN ${AppPayment.created_at} >= ${lastMonth} AND ${AppPayment.created_at} < ${thisMonth} THEN CAST(${AppPayment.amount} AS DECIMAL) ELSE 0 END), 0)`,
          })
          .from(AppPayment)
          .where(
            and(
              eq(AppPayment.storeId, storeId),
              eq(AppPayment.status, "succeeded"),
            ),
          );

        current = Number(monthlyResult[0]?.thisMonth) || 0;
        previous = Number(monthlyResult[0]?.lastMonth) || 0;
        growthPeriod = "this month";
        break;
      }
    }

    const totalRevenue = Number(totalResult[0]?.total) || 0;

    // Calculate growth percentage
    const growth =
      previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0
          ? 100
          : 0; // 100% if we have current revenue but no previous

    return {
      totalRevenue,
      growth,
      growthPeriod,
    };
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw new Error("Failed to fetch revenue stats");
  }
}
