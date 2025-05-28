import { RevenueCategoryPieChart } from "@/client/components/charts/store/revenue-category-pie-chart";
import { RevenueLineChart } from "@/client/components/charts/store/revenue-line-chart";

interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="px-4 pl-[60px] container mx-auto max-w-7xl space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Store Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analytics and insights for your store performance, revenue trends, and key business metrics.
        </p>
      </div>

      <div className="grid grid-cols-3 grid-rows-2 gap-2">
  
          <RevenueLineChart storeId={storeId} />
          <RevenueCategoryPieChart storeId={storeId}/>
        <div className="bg-purple-400/10 rounded-md"></div>
        <div className="bg-purple-400/10 rounded-md"></div>
      </div>
    </div>
  );
}
