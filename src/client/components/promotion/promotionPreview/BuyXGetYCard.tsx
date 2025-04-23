import PromotionHeader from "./PromotionHeader";
import PromotionPeriod from "./PromotionPeriod";

interface BuyXGetYCardProps {
  promotionName: string;
  discountType: string;
  discountValue: number;
  currency: string;
  buyQuantity: number;
  getQuantity: number;
  xSelectionType: string;
  ySelectionType: string;
  firstXItem: string;
  firstYItem: string;
  xProducts: string[];
  yProducts: string[];
  couponCode?: string;
  minimumPurchase: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  durationDisplay: string;
  detailedDuration: string;
}

export default function BuyXGetYCard({
  promotionName,
  discountType,
  discountValue,
  currency,
  buyQuantity,
  getQuantity,
  xSelectionType,
  ySelectionType,
  firstXItem,
  firstYItem,
  xProducts,
  yProducts,
  couponCode,
  minimumPurchase,
  startDate,
  endDate,
  isActive,
  durationDisplay,
  detailedDuration,
}: BuyXGetYCardProps) {
  const getDiscountText = () => {
    return discountValue >= 100 ? "FREE" : `${discountValue}% OFF`;
  };

  return (
    <div className="space-y-3">
      <PromotionHeader
        promotionName={promotionName}
        discountType={discountType}
        discountValue={discountValue}
        currency={currency}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted p-2">
            <span className="font-bold">1</span>
          </div>
          <span className="text-sm">
            Buy <span className="font-bold">{buyQuantity}</span>{" "}
            {buyQuantity > 1 ? "items" : "item"} of{" "}
            <span className="font-semibold">
              {xSelectionType === "specific_products"
                ? xProducts.length > 1
                  ? `${firstXItem} or other selected products`
                  : firstXItem
                : "products from selected categories"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted p-2">
            <span className="font-bold">2</span>
          </div>
          <span className="text-sm">
            Get <span className="font-bold">{getQuantity}</span>{" "}
            {getQuantity > 1 ? "items" : "item"} of{" "}
            <span className="font-semibold">
              {ySelectionType === "same_product"
                ? "the same product"
                : ySelectionType === "specific_products"
                  ? yProducts.length > 1
                    ? `${firstYItem} or other selected products`
                    : firstYItem
                  : "products from selected categories"}
            </span>
            <span className="font-bold text-primary"> {getDiscountText()}</span>
          </span>
        </div>
      </div>

      {/* Example products visualization */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {Array(Math.min(buyQuantity, 4))
              .fill(0)
              .map((_, i) => (
                <div
                  key={`buy-${i}`}
                  className="flex h-12 w-12 items-center justify-center rounded bg-muted shadow-sm"
                >
                  <span className="text-xs">Item</span>
                </div>
              ))}
            {buyQuantity > 4 && (
              <div className="flex h-12 items-center justify-center rounded px-2 text-muted-foreground">
                +{buyQuantity - 4} more
              </div>
            )}
          </div>
          <span className="mt-1 text-sm">Buy {buyQuantity}</span>
        </div>

        <div className="font-bold">+</div>

        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {Array(Math.min(getQuantity, 4))
              .fill(0)
              .map((_, i) => (
                <div
                  key={`get-${i}`}
                  className="flex h-12 w-12 items-center justify-center rounded border-2 border-dashed border-primary bg-primary/20 shadow-sm"
                >
                  <span className="text-center text-xs font-medium text-primary">
                    {discountValue >= 100 ? (
                      "FREE"
                    ) : (
                      <>
                        {discountValue}%
                        <br />
                        OFF
                      </>
                    )}
                  </span>
                </div>
              ))}
            {getQuantity > 4 && (
              <div className="flex h-12 items-center justify-center rounded px-2 text-muted-foreground">
                +{getQuantity - 4} more
              </div>
            )}
          </div>
          <span className="mt-1 text-sm">Get {getQuantity}</span>
        </div>
      </div>

      {/* Coupon Code (if applicable) */}
      {couponCode && (
        <div className="rounded-md bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">Use code:</span>
          <div className="mt-1 inline-block rounded-md border border-primary/30 bg-primary/10 px-3 py-1 font-mono font-medium">
            {couponCode}
          </div>
        </div>
      )}

      {/* Minimum Purchase (if applicable) */}
      {minimumPurchase > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm">
            Minimum purchase:{" "}
            <span className="font-medium">
              {currency}
              {minimumPurchase}
            </span>
          </p>
        </div>
      )}

      {/* Promotion Period with enhanced display */}
      <PromotionPeriod
        startDate={startDate}
        endDate={endDate}
        isActive={isActive}
        durationDisplay={durationDisplay}
        detailedDuration={detailedDuration}
      />
    </div>
  );
}
