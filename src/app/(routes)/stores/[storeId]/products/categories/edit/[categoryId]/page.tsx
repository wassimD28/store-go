import UpdateCategoryForm from "@/client/components/forms/product/updateCategoryForm";

async function page({
  params,
}: {
  params: Promise<{ storeId: string, categoryId:string }> | { storeId: string, categoryId:string };
}) {
  // First, properly await the params object
  const resolvedParams = await Promise.resolve(params);
  const storeId = resolvedParams.storeId;
  const categoryId = resolvedParams.categoryId;
  return (
    <div className="h-full w-full">
      <UpdateCategoryForm storeId={storeId} categoryId={categoryId} />
    </div>
  );
}

export default page;