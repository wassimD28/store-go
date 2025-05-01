import { Control } from "react-hook-form";
import * as z from "zod";
import { FormField, FormItem, FormMessage } from "@/client/components/ui/form";
import { CardHeader, CardContent } from "@/client/components/ui/card";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import ProductSelector from "../selector/productSelector";
import CategorySelector from "../selector/categorySelector";

interface ProductSelectionSectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  storeId: string;
}

export default function ProductSelectionSection({
  control,
  storeId,
}: ProductSelectionSectionProps) {
  return (
    <>
      <CardHeader className="text-xl font-semibold">
        Product Selection
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="applicableProducts"
          render={({ field }) => (
            <FormItem>
              <ProductSelector
                storeId={storeId}
                selectedProductIds={field.value}
                onSelectionChange={field.onChange}
                label="Select Products for This Promotion"
                description="Choose which products this promotion will apply to. Leave empty to apply to all products."
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="applicableCategories"
          render={({ field }) => (
            <FormItem>
              <CategorySelector
                storeId={storeId}
                selectedCategoryIds={field.value}
                onSelectionChange={field.onChange}
                label="Select Categories for This Promotion"
                description="Choose which product categories this promotion will apply to. Leave empty to apply to all categories."
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}
