
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/client/components/ui/button";
import { Form } from "@/client/components/ui/form";
import { Card, CardContent, CardHeader } from "@/client/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { DiscountType } from "@/lib/types/enums/common.enum";
import { createPromotion } from "@/app/actions/promotion.actions";

// Import refactored sections
import BasicInfoSection from "../../promotion/BasicInfoSection";
import DiscountTypeSection from "../../promotion/DiscountTypeSection";
import BuyXGetYSection from "../../promotion/BuyXGetYSection";
import DiscountDetailsSection from "../../promotion/discountDetailsSection";
import ProductSelectionSection from "../../promotion/ProductSelectionSection";
import PromotionDurationPicker from "../../promotion/promotionDurationPicker";
import PromotionImageSection from "../../promotion/PromotionImageSection";
import PromotionPreview from "../../promotion/promotionPreview";

// Create the promotion schema (keep this unchanged)
export const createPromotionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  discountType: z.enum([
    DiscountType.Percentage,
    DiscountType.FixedAmount,
    DiscountType.FreeShipping,
    DiscountType.BuyXGetY,
  ]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  couponCode: z.string().optional(),
  minimumPurchase: z
    .number()
    .min(0, "Minimum purchase must be positive")
    .optional(),
  promotionImage: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),

  // Buy X Get Y specific fields
  buyQuantity: z.number().min(1).optional(),
  getQuantity: z.number().min(1).optional(),

  // X products/categories - what customers need to buy
  xSelectionType: z
    .enum(["specific_products", "categories"])
    .default("specific_products"),
  xApplicableProducts: z.array(z.string()).default([]),
  xApplicableCategories: z.array(z.string()).default([]),

  // Y products/categories - what customers get discounted/free
  ySelectionType: z
    .enum(["same_product", "specific_products", "categories"])
    .default("same_product"),
  yApplicableProducts: z.array(z.string()).default([]),
  yApplicableCategories: z.array(z.string()).default([]),

  // Standard product/category selection - for non Buy X Get Y discounts
  applicableProducts: z.array(z.string()).default([]),
  applicableCategories: z.array(z.string()).default([]),
});

interface CreatePromotionFormProps {
  storeId: string;
  currency: string;
}

export default function CreatePromotionForm({
  storeId,
  currency,
}: CreatePromotionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: authData } = authClient.useSession();

  const form = useForm<z.infer<typeof createPromotionSchema>>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: DiscountType.Percentage,
      discountValue: 0,
      couponCode: "",
      minimumPurchase: 0,
      promotionImage: "",
      buyQuantity: 1,
      getQuantity: 1,
      xSelectionType: "specific_products",
      xApplicableProducts: [],
      xApplicableCategories: [],
      ySelectionType: "same_product",
      yApplicableProducts: [],
      yApplicableCategories: [],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
    },
  });

  // Get the current discount type value to conditionally render components
  const currentDiscountType = form.watch("discountType");
  const isBuyXGetY = currentDiscountType === DiscountType.BuyXGetY;

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof createPromotionSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Creating promotion...");

      // Verify user and store are available
      const userId = authData?.user?.id;
      if (!userId) {
        toast.dismiss(loadingToast);
        toast.error("No user ID available. Please log in again.");
        return;
      }

      if (!storeId) {
        toast.dismiss(loadingToast);
        toast.error("No store selected. Please select a store first.");
        return;
      }

      // Prepare promotion data
      const promotionData = {
        userId,
        storeId,
        name: values.name,
        description: values.description || null,
        discountType: values.discountType,
        discountValue: values.discountValue,
        couponCode: values.couponCode || null,
        minimumPurchase: values.minimumPurchase || 0,
        promotionImage: values.promotionImage || null,
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: values.isActive,

        // For Buy X Get Y discount type
        buyQuantity: isBuyXGetY ? values.buyQuantity : undefined,
        getQuantity: isBuyXGetY ? values.getQuantity : undefined,
        sameProductOnly: isBuyXGetY
          ? values.ySelectionType === "same_product"
          : undefined,

        // Set applicable products/categories based on discount type
        ...(isBuyXGetY
          ? {
              // X products/categories
              applicableProducts:
                values.xSelectionType === "specific_products"
                  ? values.xApplicableProducts
                  : [],
              applicableCategories:
                values.xSelectionType === "categories"
                  ? values.xApplicableCategories
                  : [],

              // Y products/categories
              yApplicableProducts:
                values.ySelectionType === "specific_products"
                  ? values.yApplicableProducts
                  : [],
              yApplicableCategories:
                values.ySelectionType === "categories"
                  ? values.yApplicableCategories
                  : [],
            }
          : {
              // Standard applicableProducts/Categories for regular discounts
              applicableProducts: values.applicableProducts,
              applicableCategories: values.applicableCategories,
            }),
      };

      // Create the promotion
      const response = await createPromotion(promotionData);
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Promotion created successfully!");
        router.push(`/stores/${storeId}/marketing/promotions`);
        router.refresh();
      } else {
        toast.error(response.error || "Failed to create promotion.");
      }
    } catch (error) {
      console.error("Promotion creation error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create promotion. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if form can be submitted
  const canSubmit = !!storeId && !!authData?.user?.id;

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-4 pl-[80px] pr-4">
        {/* Form section (scrollable) - takes 2/3 of the space */}
        <div className="space-y-8 lg:col-span-2">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-4xl space-y-8 py-10"
          >
            {/* Basic Information Section */}
            <Card className="shadow-custom-2xl">
              <BasicInfoSection control={form.control} />
            </Card>

            {/* Discount Type Selection */}
            <Card className="shadow-custom-2xl">
              <DiscountTypeSection control={form.control} />
            </Card>

            {/* Buy X Get Y Configuration (conditional) */}
            {isBuyXGetY && (
              <Card className="shadow-custom-2xl">
                <BuyXGetYSection control={form.control} storeId={storeId} />
              </Card>
            )}

            {/* Discount Details Section */}
            <Card className="shadow-custom-2xl">
              <DiscountDetailsSection
                control={form.control}
                currency={currency}
              />
            </Card>

            {/* Standard Product Selection (conditional) */}
            {!isBuyXGetY && (
              <Card className="shadow-custom-2xl">
                <ProductSelectionSection
                  control={form.control}
                  storeId={storeId}
                />
              </Card>
            )}

            {/* Duration Picker */}
            <PromotionDurationPicker disabled={isSubmitting} />

            {/* Promotion Image */}
            <Card className="shadow-custom-2xl">
              <PromotionImageSection control={form.control} />
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                type="submit"
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? "Creating..." : "Create Promotion"}
              </Button>
            </div>

            {!canSubmit && (
              <p className="text-center text-red-500">
                You must be logged in and have a store selected to create a
                promotion.
              </p>
            )}
          </form>
        </div>
        {/* Summary section (fixed) - takes 1/3 of the space */}
        <div className="relative lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <Card className="shadow-custom-2xl">
              <CardHeader className="pb-2">
                <h3 className=" text-lg font-semibold">
                  Promotion Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  Here&apos;s how your promotion will work for customers
                </p>
              </CardHeader>
              <CardContent>
                <PromotionPreview control={form.control} currency={currency} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Form>
  );
}
