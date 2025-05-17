"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/client/components/ui/button";
import { Form } from "@/client/components/ui/form";
import { Card } from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { DiscountType } from "@/lib/types/enums/common.enum";
import {
  getPromotionById,
  updatePromotion,
} from "@/app/actions/promotion.actions";

// Import refactored sections
import BasicInfoSection from "../../promotion/BasicInfoSection";
import DiscountTypeSection from "../../promotion/DiscountTypeSection";
import BuyXGetYSection from "../../promotion/BuyXGetYSection";
import DiscountDetailsSection from "../../promotion/discountDetailsSection";
import ProductSelectionSection from "../../promotion/ProductSelectionSection";
import PromotionDurationPicker from "../../promotion/promotionDurationPicker";
import PromotionImageSection from "../../promotion/PromotionImageSection";
import PromotionPreview from "../../promotion/promotionPreview";
import { createPromotionSchema } from "../promotion/createPromotionForm";

interface UpdatePromotionFormProps {
  storeId: string;
  promotionId: string;
  currency: string;
}

export default function UpdatePromotionForm({
  storeId,
  promotionId,
  currency,
}: UpdatePromotionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 7 days from now
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
    },
  });

  const discountType = form.watch("discountType");
  const isBuyXGetY = discountType === DiscountType.BuyXGetY;

  // Fetch the promotion data when component mounts
  useEffect(() => {
    const fetchPromotionData = async () => {
      try {
        setIsLoading(true);
        const response = await getPromotionById(promotionId);

        if (response.success && response.promotion) {
          const promotion = response.promotion;

          // Reset form with promotion data
          form.reset({
            name: promotion.name,
            description: promotion.description || "",
            discountType: promotion.discountType as DiscountType,
            discountValue: parseFloat(promotion.discountValue),
            couponCode: promotion.couponCode || "",
            minimumPurchase: parseFloat(promotion.minimumPurchase),
            promotionImage: promotion.promotionImage || "",
            startDate: new Date(promotion.startDate),
            endDate: new Date(promotion.endDate),
            isActive: promotion.isActive,
            buyQuantity: promotion.buyQuantity || 1,
            getQuantity: promotion.getQuantity || 1,
            xSelectionType: "specific_products", // Default values, adjust if available in your schema
            xApplicableProducts: Array.isArray(promotion.applicableProducts)
              ? promotion.applicableProducts
              : [],
            xApplicableCategories: Array.isArray(promotion.applicableCategories)
              ? promotion.applicableCategories
              : [],
            ySelectionType: promotion.sameProductOnly
              ? "same_product"
              : "specific_products",
            yApplicableProducts: Array.isArray(promotion.yApplicableProducts)
              ? promotion.yApplicableProducts
              : [],
            yApplicableCategories: Array.isArray(
              promotion.yApplicableCategories,
            )
              ? promotion.yApplicableCategories
              : [],
            applicableProducts: Array.isArray(promotion.applicableProducts)
              ? promotion.applicableProducts
              : [],
            applicableCategories: Array.isArray(promotion.applicableCategories)
              ? promotion.applicableCategories
              : [],
          });
        } else {
          toast.error("Failed to fetch promotion data");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching promotion data:", error);
        toast.error("Failed to fetch promotion data");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotionData();
  }, [promotionId, form, router]);

  const onSubmit = async (values: z.infer<typeof createPromotionSchema>) => {
    if (!authData?.user?.id) {
      toast.error("You need to be logged in to update a promotion");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the data for updating the promotion
      const formattedData = {
        id: promotionId,
        userId: authData.user.id,
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
        applicableProducts:
          values.discountType === DiscountType.BuyXGetY
            ? values.xApplicableProducts
            : values.applicableProducts,
        applicableCategories:
          values.discountType === DiscountType.BuyXGetY
            ? values.xApplicableCategories
            : values.applicableCategories,
        buyQuantity:
          values.discountType === DiscountType.BuyXGetY
            ? values.buyQuantity
            : undefined,
        getQuantity:
          values.discountType === DiscountType.BuyXGetY
            ? values.getQuantity
            : undefined,
        sameProductOnly:
          values.discountType === DiscountType.BuyXGetY
            ? values.ySelectionType === "same_product"
            : undefined,
        yApplicableProducts:
          values.discountType === DiscountType.BuyXGetY &&
          values.ySelectionType !== "same_product"
            ? values.yApplicableProducts
            : undefined,
        yApplicableCategories:
          values.discountType === DiscountType.BuyXGetY &&
          values.ySelectionType !== "same_product"
            ? values.yApplicableCategories
            : undefined,
      };

      const result = await updatePromotion(formattedData);

      if (result.success) {
        toast.success("Promotion updated successfully!");
        router.push(`/stores/${storeId}/promotions`);
      } else {
        toast.error(result.error || "Failed to update promotion");
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Show loading state while fetching promotion data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 py-10 pl-[80px] pr-4 lg:grid-cols-4">
          {/* Form section skeleton */}
          <div className="space-y-8 lg:col-span-2">
            <div className="mx-auto max-w-4xl space-y-8 py-10">
              {/* Basic Info Section Skeleton */}
              <Card className="p-6 shadow-custom-2xl">
                <Skeleton className="mb-4 h-8 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </Card>

              {/* Discount Type Section Skeleton */}
              <Card className="p-6 shadow-custom-2xl">
                <Skeleton className="mb-4 h-8 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>

              {/* Discount Details Section Skeleton */}
              <Card className="p-6 shadow-custom-2xl">
                <Skeleton className="mb-4 h-8 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>

              {/* Product Selection Section Skeleton */}
              <Card className="p-6 shadow-custom-2xl">
                <Skeleton className="mb-4 h-8 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </Card>

              {/* Form Actions Skeleton */}
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          {/* Preview section skeleton */}
          <div className="relative lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <Card className="p-6 shadow-custom-2xl">
                <Skeleton className="mb-4 h-8 w-48" />
                <Skeleton className="h-[400px] w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 py-10 pl-[80px] pr-4 lg:grid-cols-4">
        {/* Form section (scrollable) - takes 2/3 of the space */}
        <div className="space-y-8 lg:col-span-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-4xl space-y-8 py-10"
            >
              <Card className="shadow-custom-2xl">
                <BasicInfoSection
                  control={form.control}
                  title="Edit Promotion"
                />
              </Card>
              <Card className="shadow-custom-2xl">
                <DiscountTypeSection control={form.control} />
              </Card>{" "}
              {isBuyXGetY ? (
                <Card className="shadow-custom-2xl">
                  <BuyXGetYSection control={form.control} storeId={storeId} />
                </Card>
              ) : (
                <Card className="shadow-custom-2xl">
                  <DiscountDetailsSection
                    control={form.control}
                    currency={currency}
                  />
                </Card>
              )}
              <Card className="shadow-custom-2xl">
                <ProductSelectionSection
                  control={form.control}
                  storeId={storeId}
                />
              </Card>
              <Card className="shadow-custom-2xl">
                <PromotionDurationPicker />
              </Card>
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
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Promotion"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Summary section (fixed) - takes 1/3 of the space */}
        <div className="relative lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <PromotionPreview control={form.control} currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
}
