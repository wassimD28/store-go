import { Suspense } from "react";
import GenerationJobsTableContainer from "@/client/components/data-table/table-container/generationJob.table-container";
import { Skeleton } from "@/client/components/ui/skeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="flex h-full flex-col p-6">
      <Suspense fallback={<GenerationJobsLoadingSkeleton />}>
        <GenerationJobsTableContainer storeId={storeId} />
      </Suspense>
    </div>
  );
}

// Loading skeleton for better UX during data fetching
function GenerationJobsLoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="rounded-lg border p-1">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
