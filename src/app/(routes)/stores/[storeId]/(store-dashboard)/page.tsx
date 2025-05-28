import { RevenueCategoryPieChart } from "@/client/components/charts/store/revenue-category-pie-chart";
import { RevenueLineChart } from "@/client/components/charts/store/revenue-line-chart";
import { TopTenSellingProductsBarChart } from "@/client/components/charts/store/topten-selling-products-bar-chart";

interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="px-6 pl-[80px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Store Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive analytics and insights for your store performance,
          revenue trends, and key business metrics.
        </p>
      </div>{" "}
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        <RevenueLineChart storeId={storeId} />
        <RevenueCategoryPieChart storeId={storeId} />
        <TopTenSellingProductsBarChart
          className="row-span-2"
          storeId={storeId}
        />
        <div className="rounded-md bg-purple-400/10"></div>
      </div>
    </div>
  );
}
