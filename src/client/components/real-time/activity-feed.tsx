"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Star,
  UserPlus,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";
import {
  formatDistanceToNow,
  format,
  startOfMinute,
  subMinutes,
} from "date-fns";
import Pusher from "pusher-js";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

interface ActivityEvent {
  id: string;
  type:
    | "new-review"
    | "new-user"
    | "new-order"
    | "order-status-change"
    | "payment-received"
    | "payment-failed"
    | "payment-requires-action";
  title: string;
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

interface ChartDataPoint {
  time: string;
  timeLabel: string;
  "new-review": number;
  "new-user": number;
  "new-order": number;
  "order-status-change": number;
  "payment-received": number;
  "payment-failed": number;
  "payment-requires-action": number;
  total: number;
}

const eventIcons = {
  "new-review": Star,
  "new-user": UserPlus,
  "new-order": ShoppingCart,
  "order-status-change": Clock,
  "payment-received": CheckCircle,
  "payment-failed": XCircle,
  "payment-requires-action": AlertCircle,
};

const eventColors = {
  "new-review": "text-yellow-600 bg-yellow-50",
  "new-user": "text-green-600 bg-green-50",
  "new-order": "text-blue-600 bg-blue-50",
  "order-status-change": "text-orange-600 bg-orange-50",
  "payment-received": "text-green-600 bg-green-50",
  "payment-failed": "text-red-600 bg-red-50",
  "payment-requires-action": "text-yellow-600 bg-yellow-50",
};

const chartConfig = {
  "new-review": {
    label: "Reviews",
    color: "hsl(var(--chart-1))",
  },
  "new-user": {
    label: "New Users",
    color: "hsl(var(--chart-2))",
  },
  "new-order": {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
  "order-status-change": {
    label: "Status Changes",
    color: "hsl(var(--chart-4))",
  },
  "payment-received": {
    label: "Payments",
    color: "hsl(var(--chart-5))",
  },
  "payment-failed": {
    label: "Failed Payments",
    color: "#ef4444",
  },
  "payment-requires-action": {
    label: "Action Required",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"feed" | "chart">("feed");
  const params = useParams();
  const storeId = params.storeId as string;
  // Generate time intervals for the past 30 minutes (30 1-minute intervals)
  const generateTimeIntervals = () => {
    const intervals: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const time = subMinutes(now, i); // 1-minute intervals
      const timeStart = startOfMinute(time);

      intervals.push({
        time: timeStart.toISOString(),
        timeLabel: format(timeStart, "HH:mm"),
        "new-review": 0,
        "new-user": 0,
        "new-order": 0,
        "order-status-change": 0,
        "payment-received": 0,
        "payment-failed": 0,
        "payment-requires-action": 0,
        total: 0,
      });
    }

    return intervals;
  };

  // Fetch historical data on component mount
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!storeId) return;

      try {
        setLoading(true); // Fetch data from the past 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const response = await fetch(
          `/api/stores/${storeId}/activities?since=${thirtyMinutesAgo.toISOString()}&limit=1000`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historical data");
        }

        const historicalActivities = await response.json();

        // Initialize chart data with time intervals
        const intervals = generateTimeIntervals(); // Map historical activities to time intervals
        historicalActivities.forEach(
          (activity: {
            id: string;
            type: string;
            timestamp: string;
            status?: string;
          }) => {
            const activityTime = new Date(activity.timestamp);
            const intervalIndex = Math.floor(
              (activityTime.getTime() - new Date(intervals[0].time).getTime()) /
                (1 * 60 * 1000), // 1-minute intervals
            );

            if (intervalIndex >= 0 && intervalIndex < intervals.length) {
              const eventType = mapActivityToEventType(activity);
              if (eventType && intervals[intervalIndex]) {
                intervals[intervalIndex][eventType]++;
                intervals[intervalIndex].total++;
              }
            }
          },
        );

        setChartData(intervals);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        // Initialize with empty intervals on error
        setChartData(generateTimeIntervals());
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [storeId]);
  // Map API activity types to our event types
  const mapActivityToEventType = (activity: {
    type: string;
    status?: string;
  }): keyof typeof eventIcons | null => {
    switch (activity.type) {
      case "order":
        return activity.status === "pending"
          ? "new-order"
          : "order-status-change";
      case "payment":
        if (activity.status === "succeeded") return "payment-received";
        if (activity.status === "failed") return "payment-failed";
        if (activity.status === "requires_action")
          return "payment-requires-action";
        return null;
      case "user":
        return "new-user";
      case "review":
        return "new-review";
      default:
        return null;
    }
  };

  // Real-time Pusher setup
  useEffect(() => {
    if (!storeId) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn(
        "Pusher configuration missing. Real-time activity feed disabled.",
      );
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`store-${storeId}`);
    const eventTypes = [
      "new-review",
      "new-user",
      "new-order",
      "order-status-change",
      "payment-received",
      "payment-failed",
      "payment-requires-action",
    ];

    const handleActivity =
      (eventType: string) => (data: Record<string, unknown>) => {
        const newActivity: ActivityEvent = {
          id: `${eventType}-${Date.now()}-${Math.random()}`,
          type: eventType as ActivityEvent["type"],
          title: (data.title as string) || `New ${eventType.replace("-", " ")}`,
          content: (data.content as string) || "",
          timestamp: new Date(),
          data: data.data as Record<string, unknown>,
        };
        setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        // Update chart data with new activity
        setChartData((prevData) => {
          const newData = [...prevData];
          const now = new Date();
          const currentMinute = startOfMinute(now);

          // Find the interval for the current minute
          const currentIntervalIndex = newData.findIndex(
            (interval) => interval.timeLabel === format(currentMinute, "HH:mm"),
          );

          if (currentIntervalIndex !== -1 && newData[currentIntervalIndex]) {
            newData[currentIntervalIndex][eventType as keyof ChartDataPoint]++;
            newData[currentIntervalIndex].total++;
          }

          return newData;
        });
      };

    eventTypes.forEach((eventType) => {
      channel.bind(eventType, handleActivity(eventType));
    });
    return () => {
      eventTypes.forEach((eventType) => {
        channel.unbind(eventType);
      });
      pusher.unsubscribe(`store-${storeId}`);
      pusher.disconnect();
    };
  }, [storeId]);

  // Update chart data every second to create sliding window effect
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        // Only update if we have data and we're on the chart view
        if (prevData.length === 0) return prevData;

        // Generate fresh intervals to maintain the sliding 30-minute window
        const newIntervals = generateTimeIntervals();

        // Preserve existing data within the new time window
        const updatedIntervals = newIntervals.map((newInterval) => {
          const existingInterval = prevData.find(
            (prev) => prev.timeLabel === newInterval.timeLabel,
          );
          return existingInterval || newInterval;
        });

        return updatedIntervals;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="col-span-2 h-full rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-foreground" />
            <h3 className="text-lg font-semibold">Real-time Activity</h3>
          </div>
        </div>
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading activity data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="col-span-2 flex h-full flex-col bg-card shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-foreground" />
            <CardTitle>Real-time Activity</CardTitle>
            <div className="ml-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Live
              </div>
            </div>
          </div>
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as "feed" | "chart")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>{" "}
        <CardDescription>
          {activeView === "feed"
            ? "Latest activities in real-time"
            : "Activity trends over the past 30 minutes"}
        </CardDescription>
      </CardHeader>{" "}
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeView} className="flex h-full flex-col">
          <TabsContent value="feed" className="m-0 flex-1 overflow-hidden">
            {!activities.length ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <Activity className="mb-4 h-16 w-16 rounded-full bg-muted p-4 text-muted-foreground" />
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  No recent activity
                </h4>
                <p className="text-sm text-muted-foreground">
                  New activities will appear here as they happen in real-time.
                </p>
              </div>
            ) : (
              <div className="h-full overflow-auto p-6">
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = eventIcons[activity.type];
                    const colorClass = eventColors[activity.type];

                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            colorClass,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium leading-tight text-gray-900">
                                {activity.title}
                              </p>
                              {activity.content && (
                                <p className="mt-1 text-sm leading-tight text-gray-600">
                                  {activity.content}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-gray-500">
                            {formatDistanceToNow(activity.timestamp, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="m-0 flex-1 overflow-hidden p-6">
            <div className="h-full max-h-full">
              <ChartContainer
                config={chartConfig}
                className="h-full max-h-full w-full"
              >
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                  className="h-full w-full"
                >
                  <CartesianGrid strokeDasharray="3 3" />{" "}
                  <XAxis
                    dataKey="timeLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value, name) => [
                          `${value} events`,
                          chartConfig[name as keyof typeof chartConfig]
                            ?.label || name,
                        ]}
                      />
                    }
                  />
                  {/* Render an area for each event type */}
                  <Area
                    type="monotone"
                    dataKey="new-order"
                    stackId="1"
                    stroke={chartConfig["new-order"].color}
                    fill={chartConfig["new-order"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="payment-received"
                    stackId="1"
                    stroke={chartConfig["payment-received"].color}
                    fill={chartConfig["payment-received"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="new-user"
                    stackId="1"
                    stroke={chartConfig["new-user"].color}
                    fill={chartConfig["new-user"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="new-review"
                    stackId="1"
                    stroke={chartConfig["new-review"].color}
                    fill={chartConfig["new-review"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="order-status-change"
                    stackId="1"
                    stroke={chartConfig["order-status-change"].color}
                    fill={chartConfig["order-status-change"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="payment-failed"
                    stackId="1"
                    stroke={chartConfig["payment-failed"].color}
                    fill={chartConfig["payment-failed"].color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="payment-requires-action"
                    stackId="1"
                    stroke={chartConfig["payment-requires-action"].color}
                    fill={chartConfig["payment-requires-action"].color}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {activeView === "feed" && activities.length > 0 && (
        <div className="rounded-b-lg border-t bg-gray-50 p-4">
          <p className="text-center text-xs text-gray-500">
            Showing last {activities.length} activities • Updates automatically
          </p>
        </div>
      )}
    </Card>
  );
}
