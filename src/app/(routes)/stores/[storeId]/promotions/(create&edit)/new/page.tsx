import { getStoreById } from "@/app/actions/store.actions";
import CreatePromotionForm from "@/client/components/forms/promotion/createPromotionForm";

async function page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  // Properly await the params object
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;

  // Fetch store details to get the currency
  const storeResponse = await getStoreById(storeId);

  if (!storeResponse.success || !storeResponse.data) {
    return <div>Store not found</div>;
  }

  const currency = storeResponse.data.currency;

  return (
    <div className="w-full">
      <CreatePromotionForm storeId={storeId} currency={currency ?? "TND"} />
    </div>
  );
}

export default page;
