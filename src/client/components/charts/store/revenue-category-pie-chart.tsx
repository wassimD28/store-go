"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
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
}

export function RevenueCategoryPieChart({
  storeId,
}: RevenueCategoryPieChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryRevenueData[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    topCategory: string;
    topCategoryPercentage: number;
  }>({ totalRevenue: 0, topCategory: "", topCategoryPercentage: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, statsData] = await Promise.all([
          getCategoryRevenueData(storeId),
          getCategoryRevenueStats(storeId),
        ]);
        setCategoryData(data);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching category revenue data:", error);
        setCategoryData([]);
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
  if (loading) {
    return (
      <Card className="flex flex-col">
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

  return (
    <Card className="flex flex-col">
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
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Top Category: {stats.topCategory} (
          {stats.topCategoryPercentage.toFixed(1)}%)
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Revenue breakdown by product categories
        </div>
      </CardFooter>
    </Card>
  );
}
