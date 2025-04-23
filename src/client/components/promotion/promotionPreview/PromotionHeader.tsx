import { Badge } from "@/client/components/ui/badge";
import { Separator } from "@/client/components/ui/separator";
import { DiscountType } from "@/lib/types/enums/common.enum";
import { PercentIcon, TagIcon, TruckIcon, ShoppingBagIcon } from "lucide-react";

interface PromotionHeaderProps {
  promotionName: string;
  discountType: string;
  discountValue: number;
  currency: string;
}

export default function PromotionHeader({
  promotionName,
  discountType,
  discountValue,
  currency,
}: PromotionHeaderProps) {
  // Helper function to get discount text based on type
  const getDiscountText = () => {
    switch (discountType) {
      case DiscountType.Percentage:
        return `${discountValue}% OFF`;
      case DiscountType.FixedAmount:
        return `${currency} ${discountValue} OFF`;
      case DiscountType.FreeShipping:
        return "FREE SHIPPING";
      case DiscountType.BuyXGetY:
        const isFullyFree = discountValue >= 100;
        return isFullyFree ? "FREE" : `${discountValue}% OFF`;
      default:
        return "DISCOUNT";
    }
  };

  // Get the discount icon based on discount type
  const getDiscountIcon = () => {
    switch (discountType) {
      case DiscountType.Percentage:
        return <PercentIcon className="h-4 w-4" />;
      case DiscountType.FixedAmount:
        return <TagIcon className="h-4 w-4" />;
      case DiscountType.FreeShipping:
        return <TruckIcon className="h-4 w-4" />;
      case DiscountType.BuyXGetY:
        return <ShoppingBagIcon className="h-4 w-4" />;
      default:
        return <TagIcon className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold">{promotionName}</h4>
        <Badge variant="outline" className="bg-primary text-primary-foreground">
          {getDiscountIcon()}
          <span className="ml-1">
            {discountType === DiscountType.BuyXGetY
              ? "BUY X GET Y"
              : getDiscountText()}
          </span>
        </Badge>
      </div>
      <Separator />
    </>
  );
}
