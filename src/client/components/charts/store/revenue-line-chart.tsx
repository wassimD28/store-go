"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/client/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/client/components/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import {
  getRevenueData,
  getRevenueStats,
  type RevenuePeriod,
  type RevenueData,
} from "@/server/actions/analytics/revenue.actions";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface RevenueLineChartProps {
  storeId: string;
}

export function RevenueLineChart({ storeId }: RevenueLineChartProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: number;
    growth: number;
    growthPeriod: string;
  }>({ totalRevenue: 0, growth: 0, growthPeriod: "" });
  const [activePeriod, setActivePeriod] = useState<RevenuePeriod>("monthly");
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(
    async (period: RevenuePeriod) => {
      try {
        setLoading(true);
        const [data, stats] = await Promise.all([
          getRevenueData(storeId, period),
          getRevenueStats(storeId, period),
        ]);
        setRevenueData(data);
        setRevenueStats(stats);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  useEffect(() => {
    fetchData(activePeriod);
  }, [activePeriod, fetchData]);

  const handlePeriodChange = (period: string) => {
    const newPeriod = period as RevenuePeriod;
    setActivePeriod(newPeriod);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };
  const periodLabels = {
    daily: "Today (24 Hours)",
    weekly: "Last 7 Days",
    monthly: "This Month (Days)",
  };

  return (
    <Card>
      <CardContent>
        <Tabs
          value={activePeriod}
          onValueChange={handlePeriodChange}
          className="space-y-4"
        >
          <TabsList className="mt-3 grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={activePeriod} className="space-y-4">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-muted-foreground">
                  Loading revenue data...
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={revenueData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                    }
                  />
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    fillOpacity={0.4}
                    stroke="var(--color-revenue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {" "}
            <div className="flex items-center gap-2 font-medium leading-none">
              {revenueStats.growth >= 0 ? (
                <>
                  Revenue trending up by{" "}
                  {Math.abs(revenueStats.growth).toFixed(1)}%{" "}
                  {revenueStats.growthPeriod} <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Revenue trending down by{" "}
                  {Math.abs(revenueStats.growth).toFixed(1)}%{" "}
                  {revenueStats.growthPeriod}{" "}
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {periodLabels[activePeriod]} • Total:{" "}
              {formatCurrency(revenueStats.totalRevenue)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
