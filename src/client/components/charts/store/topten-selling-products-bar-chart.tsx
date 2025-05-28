"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Package } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
import {
  getTopSellingProductsData,
  getTopProductsStats,
  type TopProductData,
} from "@/server/actions/analytics/top-products.actions";

const chartConfig = {
  totalQuantitySold: {
    label: "Units Sold",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface TopTenSellingProductsBarChartProps {
  className?: string;
  storeId: string;
}

export function TopTenSellingProductsBarChart({
  className,
  storeId,
}: TopTenSellingProductsBarChartProps) {
  const [productsData, setProductsData] = useState<TopProductData[]>([]);
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalQuantitySold: number;
    topProductName: string;
    topProductPercentage: number;
  }>({
    totalProducts: 0,
    totalQuantitySold: 0,
    topProductName: "",
    topProductPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, statsData] = await Promise.all([
          getTopSellingProductsData(storeId, 10),
          getTopProductsStats(storeId),
        ]);
        setProductsData(data);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching top products data:", error);
        setProductsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  // Prepare chart data with proper format for recharts
  const chartData = productsData.map((item) => ({
    productName:
      item.productName.length > 20
        ? item.productName.substring(0, 20) + "..."
        : item.productName,
    fullProductName: item.productName,
    totalQuantitySold: item.totalQuantitySold,
    totalRevenue: item.totalRevenue,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top 10 Best Selling Products</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top 10 Best Selling Products
        </CardTitle>
        <CardDescription>
          This Month • {stats.totalQuantitySold} units sold across{" "}
          {stats.totalProducts} products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No sales data available for this month
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 10,
                right: 40,
              }}
            >
              <XAxis type="number" dataKey="totalQuantitySold" hide />
              <YAxis
                dataKey="productName"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
                width={100}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium text-foreground">
                            {data.fullProductName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Units Sold
                              </span>
                              <span className="font-bold">
                                {data.totalQuantitySold}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <span className="font-bold">
                                {formatCurrency(data.totalRevenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalQuantitySold"
                fill="var(--color-totalQuantitySold)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Top seller: {stats.topProductName} (
          {stats.topProductPercentage.toFixed(1)}%)
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing units sold this month (delivered orders only)
        </div>
      </CardFooter>
    </Card>
  );
}
