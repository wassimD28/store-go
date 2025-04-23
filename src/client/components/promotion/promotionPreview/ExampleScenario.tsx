import { DiscountType } from "@/lib/types/enums/common.enum";

interface ExampleScenarioProps {
  discountType: string;
  discountValue: number;
  minimumPurchase: number;
  currency: string;
  selectedProductName: string;
  applicableProducts: string[];
  buyQuantity: number;
  getQuantity: number;
  firstXItem: string;
  firstYItem: string;
  xProducts: string[];
  yProducts: string[];
  couponCode?: string;
  ySelectionType: string;
}

export default function ExampleScenario({
  discountType,
  discountValue,
  minimumPurchase,
  currency,
  selectedProductName,
  applicableProducts,
  buyQuantity,
  getQuantity,
  firstXItem,
  firstYItem,
  xProducts,
  yProducts,
  couponCode,
  ySelectionType,
}: ExampleScenarioProps) {
  // Generate example scenario for promotion
  const getExampleScenario = () => {
    switch (discountType) {
      case DiscountType.Percentage:
        return `If a customer buys ${selectedProductName}${
          applicableProducts.length > 1 ? " or other selected products" : ""
        }, they'll receive ${discountValue}% off the purchase price.`;
      case DiscountType.FixedAmount:
        return `If a customer buys ${selectedProductName}${
          applicableProducts.length > 1 ? " or other selected products" : ""
        }, they'll save ${currency}${discountValue} on the purchase price.`;
      case DiscountType.FreeShipping:
        return `Customers will receive free shipping on their order${
          minimumPurchase > 0
            ? ` when they spend at least ${minimumPurchase}${currency}`
            : ""
        }.`;
      case DiscountType.BuyXGetY:
        const isFullyFree = discountValue >= 100;
        return `If a customer adds ${buyQuantity} ${firstXItem}${
          xProducts.length > 1 ? "s or other eligible products" : ""
        } and ${getQuantity} ${firstYItem}${
          yProducts.length > 1 ? "s or other eligible products" : ""
        } to their cart, they'll pay full price for ${buyQuantity} ${
          buyQuantity > 1 ? "items" : "item"
        } and get${isFullyFree ? " free" : ` ${discountValue}% off`} on ${getQuantity} ${
          getQuantity > 1 ? "items" : "item"
        }.`;
      default:
        return "Customers will receive a special promotion on their purchase.";
    }
  };

  const isBuyXGetY = discountType === DiscountType.BuyXGetY;

  return (
    <div className="mt-4 rounded-md bg-foreground/5 p-3 text-sm">
      <p className="font-medium">Example scenario</p>
      <p className="text-xs text-foreground/50 pl-2 mt-2">{getExampleScenario()}</p>

      {couponCode && !isBuyXGetY && (
        <p className="mt-1 italic">
          The customer will need to enter the code{" "}
          <span className="font-mono font-medium">{couponCode}</span> at
          checkout.
        </p>
      )}

      {isBuyXGetY &&
        ySelectionType !== "same_product" &&
        discountValue >= 100 && (
          <p className="mt-1 text-xs pl-2 text-foreground/50">
            Note: The free items will be the eligible products with the lowest
            prices.
          </p>
        )}
    </div>
  );
}
