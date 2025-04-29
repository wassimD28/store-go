import CreateCategoryForm from "@/client/components/forms/product/createCategoryForm";

async function page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  // First, properly await the params object
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="h-full w-full">
      <CreateCategoryForm storeId={storeId} />
    </div>
  );
}

export default page;