import { DiscountType } from "@/lib/types/enums/common.enum";
import PromotionHeader from "./PromotionHeader";
import PromotionPeriod from "./PromotionPeriod";

interface StandardDiscountCardProps {
  promotionName: string;
  discountType: string;
  discountValue: number;
  currency: string;
  applicableProducts: string[];
  applicableCategories: string[];
  selectedProductName: string;
  minimumPurchase: number;
  couponCode?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  durationDisplay: string;
  detailedDuration: string;
}

export default function StandardDiscountCard({
  promotionName,
  discountType,
  discountValue,
  currency,
  applicableProducts,
  applicableCategories,
  selectedProductName,
  minimumPurchase,
  couponCode,
  startDate,
  endDate,
  isActive,
  durationDisplay,
  detailedDuration,
}: StandardDiscountCardProps) {
  // Get description text based on discount type
  const getPromotionDescription = () => {
    switch (discountType) {
      case DiscountType.Percentage:
        return `Get ${discountValue}% off${
          applicableProducts.length > 0
            ? " selected products"
            : applicableCategories.length > 0
              ? " selected categories"
              : ""
        }`;
      case DiscountType.FixedAmount:
        return `Save ${currency} ${discountValue}${
          applicableProducts.length > 0
            ? " on selected products"
            : applicableCategories.length > 0
              ? " on selected categories"
              : ""
        }`;
      case DiscountType.FreeShipping:
        return "Free shipping on your order";
      default:
        return "Special promotional offer";
    }
  };

  return (
    <div className="space-y-3">
      <PromotionHeader
        promotionName={promotionName}
        discountType={discountType}
        discountValue={discountValue}
        currency={currency}
      />

      <div className="space-y-4">
        <div className="rounded-md bg-muted/50 p-4">
          <p className="text-sm">{getPromotionDescription()}</p>

          {minimumPurchase > 0 && (
            <p className="mt-2 text-sm">
              Minimum purchase:{" "}
              <span className="font-medium text-primary">
                {minimumPurchase}{" "}
                {currency}
              </span>
            </p>
          )}

          {couponCode && (
            <div className="mt-3">
              <span className="text-sm text-muted-foreground">Use code:</span>
              <div className="mt-1 inline-block rounded-md border border-primary/30 bg-primary/10 px-3 py-1 font-mono font-medium">
                {couponCode}
              </div>
            </div>
          )}
        </div>

        {/* Product/Category display */}
        {(applicableProducts.length > 0 || applicableCategories.length > 0) && (
          <div className="rounded-md bg-muted/30 p-3 text-sm">
            <p className="font-medium">Applies to:</p>
            {applicableProducts.length > 0 && (
              <p className="mt-1">
                • {applicableProducts.length} selected product
                {applicableProducts.length !== 1 ? "s" : ""}
                {applicableProducts.length > 0 && selectedProductName && (
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    (example: {selectedProductName}
                    {applicableProducts.length > 1 ? "..." : ""})
                  </span>
                )}
              </p>
            )}
            {applicableCategories.length > 0 && (
              <p className="mt-1">
                • {applicableCategories.length} selected categor
                {applicableCategories.length !== 1 ? "ies" : "y"}
              </p>
            )}
          </div>
        )}

        {/* Enhanced Promotion Period with dates and times */}
        <PromotionPeriod
          startDate={startDate}
          endDate={endDate}
          isActive={isActive}
          durationDisplay={durationDisplay}
          detailedDuration={detailedDuration}
        />
      </div>
    </div>
  );
}
