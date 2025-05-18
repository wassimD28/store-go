import { getStoreById } from "@/app/actions/store.actions";
import { getPromotionById } from "@/app/actions/promotion.actions";
import UpdatePromotionForm from "@/client/components/forms/promotion/updatePromotionForm";
import { Suspense } from "react";

interface Props {
  params: Promise<{ storeId: string; promotionId: string }>;
}

export default async function EditPromotionPage({ params }: Props) {
  const resolvedParams = await params;
  const { storeId, promotionId } = resolvedParams;

  // Fetch store details to get the currency
  const storeResponse = await getStoreById(storeId);

  if (!storeResponse.success || !storeResponse.data) {
    return <div>Store not found</div>;
  }

  const currency = storeResponse.data.currency;

  // Get the promotion data
  const promotionResponse = await getPromotionById(promotionId);

  if (!promotionResponse.success) {
    return <div>Promotion not found</div>;
  }

  return (
    <div className="w-full">
      <Suspense
        fallback={<div className="text-center">Loading promotion data...</div>}
      >
        <UpdatePromotionForm
          storeId={storeId}
          promotionId={promotionId}
          currency={currency ?? "TND"}
        />
      </Suspense>
    </div>
  );
}
