import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { Control } from "react-hook-form";
import * as z from "zod";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import { DiscountType } from "@/lib/types/enums/common.enum";
import {
  calculateDetailedDuration,
  formatPromotionDuration,
} from "@/lib/utils";
import { getProductById } from "@/app/actions/product.actions";
import BuyXGetYCard from "./promotionPreview/BuyXGetYCard";
import StandardDiscountCard from "./promotionPreview/StandardDiscountCard";
import ExampleScenario from "./promotionPreview/ExampleScenario";

interface PromotionPreviewProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  currency: string;
}

export default function PromotionPreview({
  control,
  currency,
}: PromotionPreviewProps) {
  // Watch all fields that affect how the promotion works
  const discountType = useWatch({ control, name: "discountType" });
  const promotionName =
    useWatch({ control, name: "name" }) || "Promotion Preview";
  const discountValue = useWatch({ control, name: "discountValue" }) || 0;
  const minimumPurchase = useWatch({ control, name: "minimumPurchase" }) || 0;
  const couponCode = useWatch({ control, name: "couponCode" });
  const isActive = useWatch({ control, name: "isActive" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });

  // Duration display state
  const [durationDisplay, setDurationDisplay] = useState<string>("");
  const [detailedDuration, setDetailedDuration] = useState<string>("");

  // Buy X Get Y specific fields
  const buyQuantity = useWatch({ control, name: "buyQuantity" }) || 1;
  const getQuantity = useWatch({ control, name: "getQuantity" }) || 1;
  const ySelectionType =
    useWatch({ control, name: "ySelectionType" }) || "same_product";
  const xSelectionType =
    useWatch({ control, name: "xSelectionType" }) || "specific_products";

  // Watch product/category selections
  const rawApplicableProducts =
    useWatch({ control, name: "applicableProducts" }) || [];
  const rawApplicableCategories =
    useWatch({ control, name: "applicableCategories" }) || [];

  // Buy X Get Y specific product selections
  const rawXProducts = useWatch({ control, name: "xApplicableProducts" }) || [];
  const rawYProducts = useWatch({ control, name: "yApplicableProducts" }) || [];

  // Extract string representations for dependency arrays
  const applicableProductsString = JSON.stringify(rawApplicableProducts);
  const applicableCategoriesString = JSON.stringify(rawApplicableCategories);
  const rawXProductsString = JSON.stringify(rawXProducts);
  const rawYProductsString = JSON.stringify(rawYProducts);

  // Memoize the array values to prevent dependency changes on every render
  const xProducts = useMemo(
    () => JSON.parse(rawXProductsString),
    [rawXProductsString],
  );
  const yProducts = useMemo(
    () => JSON.parse(rawYProductsString),
    [rawYProductsString],
  );
  const applicableProducts = useMemo(
    () => JSON.parse(applicableProductsString),
    [applicableProductsString],
  );
  const applicableCategories = useMemo(
    () => JSON.parse(applicableCategoriesString),
    [applicableCategoriesString],
  );

  // State to hold selected product names for display
  const [selectedProductName, setSelectedProductName] =
    useState<string>("selected product");
  const [firstXItem, setFirstXItem] = useState<string>("selected product");
  const [firstYItem, setFirstYItem] = useState<string>("selected product");

  const isBuyXGetY = discountType === DiscountType.BuyXGetY;

  // Calculate and update duration displays whenever dates change
  useEffect(() => {
    if (!startDate || !endDate) return;

    // Use our utility functions for different duration displays
    const basicDuration = formatPromotionDuration(startDate, endDate);
    const detailed = calculateDetailedDuration(startDate, endDate, {
      maxUnits: 2,
    });

    setDurationDisplay(basicDuration);
    setDetailedDuration(detailed);
  }, [startDate, endDate]);

  // Fetch product details for regular discount types
  useEffect(() => {
    async function fetchProductDetails() {
      if (!isBuyXGetY && applicableProducts.length > 0) {
        try {
          const response = await getProductById(applicableProducts[0]);
          if (response.success && response.product) {
            setSelectedProductName(response.product.name);
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    }

    fetchProductDetails();
  }, [applicableProducts, isBuyXGetY]);

  // Fetch X product details for Buy X Get Y
  useEffect(() => {
    async function fetchXProductDetails() {
      if (
        isBuyXGetY &&
        xSelectionType === "specific_products" &&
        xProducts.length > 0
      ) {
        try {
          const response = await getProductById(xProducts[0]);
          if (response.success && response.product) {
            setFirstXItem(response.product.name);
          }
        } catch (error) {
          console.error("Error fetching X product details:", error);
        }
      } else if (isBuyXGetY && xSelectionType === "categories") {
        setFirstXItem("products from selected category");
      }
    }

    fetchXProductDetails();
  }, [xProducts, xSelectionType, isBuyXGetY]);

  // Fetch Y product details for Buy X Get Y
  useEffect(() => {
    async function fetchYProductDetails() {
      if (
        isBuyXGetY &&
        ySelectionType === "specific_products" &&
        yProducts.length > 0
      ) {
        try {
          const response = await getProductById(yProducts[0]);
          if (response.success && response.product) {
            setFirstYItem(response.product.name);
          }
        } catch (error) {
          console.error("Error fetching Y product details:", error);
        }
      } else if (isBuyXGetY && ySelectionType === "categories") {
        setFirstYItem("products from selected category");
      } else if (isBuyXGetY && ySelectionType === "same_product") {
        setFirstYItem("the same product");
      }
    }

    fetchYProductDetails();
  }, [yProducts, ySelectionType, isBuyXGetY]);

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm">
      {/* Simulated promotion card */}
      {isBuyXGetY ? (
        <BuyXGetYCard
          promotionName={promotionName}
          discountType={discountType}
          discountValue={discountValue}
          currency={currency}
          buyQuantity={buyQuantity}
          getQuantity={getQuantity}
          xSelectionType={xSelectionType}
          ySelectionType={ySelectionType}
          firstXItem={firstXItem}
          firstYItem={firstYItem}
          xProducts={xProducts}
          yProducts={yProducts}
          couponCode={couponCode}
          minimumPurchase={minimumPurchase}
          startDate={startDate}
          endDate={endDate}
          isActive={isActive}
          durationDisplay={durationDisplay}
          detailedDuration={detailedDuration}
        />
      ) : (
        <StandardDiscountCard
          promotionName={promotionName}
          discountType={discountType}
          discountValue={discountValue}
          currency={currency}
          applicableProducts={applicableProducts}
          applicableCategories={applicableCategories}
          selectedProductName={selectedProductName}
          minimumPurchase={minimumPurchase}
          couponCode={couponCode}
          startDate={startDate}
          endDate={endDate}
          isActive={isActive}
          durationDisplay={durationDisplay}
          detailedDuration={detailedDuration}
        />
      )}

      {/* Customer example scenario */}
      <ExampleScenario
        discountType={discountType}
        discountValue={discountValue}
        minimumPurchase={minimumPurchase}
        currency={currency}
        selectedProductName={selectedProductName}
        applicableProducts={applicableProducts}
        buyQuantity={buyQuantity}
        getQuantity={getQuantity}
        firstXItem={firstXItem}
        firstYItem={firstYItem}
        xProducts={xProducts}
        yProducts={yProducts}
        couponCode={couponCode}
        ySelectionType={ySelectionType}
      />
    </div>
  );
}
