
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/client/components/ui/card";
import { authClient } from "@/lib/auth-client";
import ImageKitUploader from "../../uploader/imageKitUploader";
import { DiscountType } from "@/lib/types/enums/common.enum";
import ProductSelector from "../../selector/productSelector";
import PromotionDurationPicker from "../../picker/promotionDurationPicker";
import DiscountDetails from "../../promotion/discountDetailsSection";

// Server action imports
import { createPromotion } from "@/app/actions/promotion.actions";
import { Switch } from "../../ui/switch";
import CategorySelector from "../../selector/categorySelector";

// Create the promotion schema
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
  buyQuantity: z.number().optional(),
  getQuantity: z.number().optional(),
  ySelectionType: z
    .enum(["same_product", "specific_products", "categories"])
    .default("same_product"),
  yApplicableProducts: z.array(z.string()).default([]),
  yApplicableCategories: z.array(z.string()).default([]),
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
      buyQuantity: 1, // Add this
      getQuantity: 1, // Add this
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      applicableProducts: [],
    },
  });

  // Get the current discount type value to conditionally render components
  const currentDiscountType = form.watch("discountType");

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

      // Create the promotion
      const response = await createPromotion({
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
        applicableProducts: values.applicableProducts || [],
        applicableCategories: values.applicableCategories || [], // Now passing categories too
        // Add Buy X Get Y specific fields if that discount type is selected
        ...(values.discountType === DiscountType.BuyXGetY && {
          buyQuantity: values.buyQuantity,
          getQuantity: values.getQuantity,
          yApplicableProducts: values.yApplicableProducts,
          yApplicableCategories: values.yApplicableCategories,
          sameProductOnly: values.ySelectionType === "same_product",
        }),
      });

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

  // Handle product selection changes
  const handleProductSelectionChange = (selectedIds: string[]) => {
    // Only update if different from current value
    if (
      JSON.stringify(form.getValues("applicableProducts").sort()) !==
      JSON.stringify(selectedIds.sort())
    ) {
      form.setValue("applicableProducts", selectedIds);
    }
  };

  // Handle category selection changes
  const handleCategorySelectionChange = (selectedIds: string[]) => {
    form.setValue("applicableCategories", selectedIds);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl space-y-8 py-10"
      >
        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Create New Promotion
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Sale 2025"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special discount for summer season"
                      className="resize-none"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Discount Details
          </CardHeader>
          <CardContent>
            <DiscountDetails
              control={form.control}
              currency={currency}
              storeId={storeId}
            />
          </CardContent>
        </Card>

        {/* Use our new duration picker component here */}
        <PromotionDurationPicker disabled={isSubmitting} />

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Promotion Media
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="promotionImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Image</FormLabel>
                  <FormControl>
                    <ImageKitUploader
                      onUploadSuccess={(url) => field.onChange(url)}
                      initialImage={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image for the promotion (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Show the main product selector only when the discount type is NOT Buy X Get Y */}
        {currentDiscountType !== DiscountType.BuyXGetY && (
          <Card className="shadow-custom-2xl">
            <CardHeader className="text-xl font-semibold">
              Product Selection
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="applicableProducts"
                render={({ field }) => (
                  <FormItem>
                    <ProductSelector
                      storeId={storeId}
                      selectedProductIds={field.value || []}
                      onSelectionChange={handleProductSelectionChange}
                      label="Select Products for This Promotion"
                      description="Choose which products this promotion will apply to. Leave empty to apply to all products."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add category selector */}
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="applicableCategories"
                  render={({ field }) => (
                    <FormItem>
                      <CategorySelector
                        storeId={storeId}
                        selectedCategoryIds={field.value || []}
                        onSelectionChange={handleCategorySelectionChange}
                        label="Select Categories for This Promotion"
                        description="Choose which product categories this promotion will apply to. Leave empty to apply to all categories."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-6">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Activate promotion immediately
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* For Buy X Get Y, we still need the activation switch */}
        {currentDiscountType === DiscountType.BuyXGetY && (
          <Card className="shadow-custom-2xl">
            <CardHeader className="text-xl font-semibold">
              Promotion Settings
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Activate promotion immediately
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="lg" type="submit" disabled={isSubmitting || !canSubmit}>
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
    </Form>
  );
}
