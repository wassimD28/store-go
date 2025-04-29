import CreateProductForm from "@/client/components/forms/product/createProductForm";

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
      <CreateProductForm storeId={storeId} />
    </div>
  );
}

export default page;
