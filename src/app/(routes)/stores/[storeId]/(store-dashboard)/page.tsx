import { RevenueCategoryPieChart } from "@/client/components/charts/store/revenue-category-pie-chart";
import { RevenueLineChart } from "@/client/components/charts/store/revenue-line-chart";
import { TopTenSellingProductsBarChart } from "@/client/components/charts/store/topten-selling-products-bar-chart";
import { ActivityFeed } from "@/client/components/real-time/activity-feed";

interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="h-full px-6 pb-6 pl-[80px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Store Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive analytics and insights for your store performance,
          revenue trends, and key business metrics.
        </p>{" "}
      </div>{" "}
      <div className="grid min-h-[600px] grid-cols-3 grid-rows-[400px_400px] gap-4">
        <RevenueLineChart className="col-span-2 h-full" storeId={storeId} />
        <RevenueCategoryPieChart className="h-full" storeId={storeId} />
        <TopTenSellingProductsBarChart className="h-full" storeId={storeId} />
        <ActivityFeed />
      </div>
    </div>
  );
}
