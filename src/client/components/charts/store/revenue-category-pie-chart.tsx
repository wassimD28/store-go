"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/client/components/ui/chart";
import { NumberTicker } from "@/client/components/ui/number-ticker";
import {
  getCategoryRevenueData,
  getCategoryRevenueStats,
  type CategoryRevenueData,
} from "@/server/actions/analytics/category-revenue.actions";
import { abbreviateNumber } from "@/lib/utils";

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
} satisfies ChartConfig;

interface RevenueCategoryPieChartProps {
  storeId: string;
  className?: string;
}

export function RevenueCategoryPieChart({
  storeId,
  className,
}: RevenueCategoryPieChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryRevenueData[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    topCategory: string;
    topCategoryPercentage: number;
  }>({ totalRevenue: 0, topCategory: "", topCategoryPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, statsData] = await Promise.all([
          getCategoryRevenueData(storeId),
          getCategoryRevenueStats(storeId),
        ]);
        setCategoryData(data);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching category revenue data:", error);
        setError("Failed to load revenue data");
        setCategoryData([]);
        setStats({
          totalRevenue: 0,
          topCategory: "",
          topCategoryPercentage: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Prepare chart data with proper format for recharts
  const chartData = categoryData.map((item) => ({
    category: item.category,
    revenue: item.revenue,
    fill: item.color,
  }));
  const totalRevenue = React.useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [categoryData]);
  // Check if there's no revenue data
  const hasNoRevenue =
    totalRevenue === 0 ||
    categoryData.length === 0 ||
    (categoryData.length === 1 && categoryData[0].category === "No Data");
  if (loading) {
    return (
      <Card className={`flex h-full flex-col ${className || ""}`}>
        <CardHeader className="items-center pb-0">
          <CardTitle>Revenue Distribution by Category</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`flex h-full flex-col ${className || ""}`}>
        <CardHeader className="items-center pb-0">
          <CardTitle>Revenue Distribution by Category</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <BarChart3 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-red-600">
                Failed to Load Data
              </h3>
              <p className="max-w-[200px] text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="text-center leading-none text-muted-foreground">
            Please try refreshing the page
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Show no data state when there's no revenue
  if (hasNoRevenue) {
    return (
      <Card className={`flex h-full flex-col ${className || ""}`}>
        <CardHeader className="items-center pb-0">
          <CardTitle>Revenue Distribution by Category</CardTitle>
          <CardDescription>Total Revenue: {formatCurrency(0)}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center">
            {" "}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
                No Revenue Data
              </h3>
              <p className="max-w-[200px] text-sm text-muted-foreground">
                Start making sales to see your revenue distribution by category
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="text-center leading-none text-muted-foreground">
            Revenue breakdown will appear here once you have sales
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`flex h-full flex-col ${className || ""}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Revenue Distribution by Category</CardTitle>
        <CardDescription>
          Total Revenue: {formatCurrency(totalRevenue)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.payload.category}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {formatCurrency(data.value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey="revenue"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Revenue
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>{" "}
          {/* Animated number overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="-mt-3 text-center">
              <div className="text-xl font-bold text-foreground">
                $
                <NumberTicker
                  value={abbreviateNumber(totalRevenue).value}
                  decimalPlaces={totalRevenue >= 1000 ? 1 : 0}
                  delay={0.3}
                  duration={0.3}
                />
                {abbreviateNumber(totalRevenue).suffix}
              </div>
            </div>
          </div>
        </div>{" "}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {stats.topCategory && stats.topCategory !== "No Data" ? (
          <div className="flex items-center gap-2 font-medium leading-none">
            Top Category: {stats.topCategory} (
            {stats.topCategoryPercentage.toFixed(1)}%)
            <TrendingUp className="h-4 w-4" />
          </div>
        ) : null}
        <div className="leading-none text-muted-foreground">
          Revenue breakdown by product categories
        </div>
      </CardFooter>
    </Card>
  );
}
