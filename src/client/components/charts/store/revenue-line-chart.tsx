"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardFooter } from "@/client/components/ui/card";
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
  className?: string;
}

export function RevenueLineChart({ storeId , className}: RevenueLineChartProps) {
  // Cache key for sessionStorage
  const cacheKey = `revenue-chart-cache-${storeId}`;

  // Initialize state with cached data if available
  const [cache, setCache] = useState<
    Record<
      RevenuePeriod,
      {
        data: RevenueData[];
        stats: { totalRevenue: number; growth: number; growthPeriod: string };
      }
    >
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: number;
    growth: number;
    growthPeriod: string;
  }>({ totalRevenue: 0, growth: 0, growthPeriod: "" });
  const [activePeriod, setActivePeriod] = useState<RevenuePeriod>("monthly");
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const fetchData = useCallback(
    async (period: RevenuePeriod) => {
      // Check if we have cached data for this period
      if (cache[period]) {
        setRevenueData(cache[period].data);
        setRevenueStats(cache[period].stats);
        setIsFromCache(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setIsFromCache(false);
        const [data, stats] = await Promise.all([
          getRevenueData(storeId, period),
          getRevenueStats(storeId, period),
        ]);
        setRevenueData(data);
        setRevenueStats(stats);

        // Update cache
        const newCache = {
          ...cache,
          [period]: { data, stats },
        };
        setCache(newCache);

        // Save to sessionStorage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(newCache));
          } catch (error) {
            console.warn("Failed to save cache to sessionStorage:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    },
    [storeId, cache, cacheKey, setCache],
  );
  useEffect(() => {
    fetchData(activePeriod);
  }, [activePeriod, fetchData]);

  // Clear cache on component mount (page refresh)
  useEffect(() => {
    const clearCacheOnRefresh = () => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(cacheKey);
        } catch (error) {
          console.warn("Failed to clear cache:", error);
        }
      }
    };

    // Clear cache when the component mounts (page refresh)
    clearCacheOnRefresh();

    // Optional: Clear cache when the user navigates away
    const handleBeforeUnload = () => {
      clearCacheOnRefresh();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cacheKey]);
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
    <Card className={`grid h-full min-h-full grid-rows-[85%_15%] ${className}`}>
      <CardContent className="h-full min-h-full">
        <Tabs
          value={activePeriod}
          onValueChange={handlePeriodChange}
          className="h-full min-h-full"
        >
          <TabsList className="mt-3 grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={activePeriod} className="h-[85%]">
            {loading ? (
              <div className="flex h-full min-h-full w-full items-center justify-center">
                <div className="text-muted-foreground">
                  Loading revenue data...
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={revenueData}
                  margin={{
                    left: 0,
                    right: 6,
                  }}
                  className="h-full w-full"
                >
                  <defs>
                    <clipPath id="clipAboveXAxis">
                      <rect x="0" y="0" width="100%" height="100%" />
                    </clipPath>
                  </defs>
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
                    domain={[0, "auto"]}
                    allowDataOverflow={false}
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
                    type="monotone" // Keep the monotone type for better boundary handling
                    fill="url(#fillRevenue)"
                    fillOpacity={0.4}
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    connectNulls={true}
                    clipPath="url(#clipAboveXAxis)"
                    baseValue={0} // Explicitly set base value to 0
                    isAnimationActive={true} // Re-enable animations
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
            </div>{" "}
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {periodLabels[activePeriod]} • Total:{" "}
              {formatCurrency(revenueStats.totalRevenue)}
              {isFromCache && (
                <span className="text-xs opacity-70">• Cached</span>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
