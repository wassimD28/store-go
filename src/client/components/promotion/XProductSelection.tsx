import { Control, useWatch } from "react-hook-form";
import * as z from "zod";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import { Label } from "@/client/components/ui/label";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import ProductSelector from "../selector/productSelector";
import CategorySelector from "../selector/categorySelector";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

interface XProductSelectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  storeId: string;
}

export default function XProductSelection({
  control,
  storeId,
}: XProductSelectionProps) {
  const xSelectionType = useWatch({
    control,
    name: "xSelectionType",
    defaultValue: "specific_products",
  });

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="xSelectionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Which products can be purchased as &quot;X&quot; items?
            </FormLabel>
            <FormDescription className="flex items-center gap-1">
              Choose which products customers need to purchase to qualify for
              this promotion
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      <strong>Specific products:</strong> Only selected products
                      can count as &quot;X&quot; items
                    </p>
                    <p>
                      <strong>Products from categories:</strong> Any product
                      from the selected categories can count as &quot;X&quot; items
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="specific_products"
                    id="x_specific_products"
                  />
                  <Label
                    htmlFor="x_specific_products"
                    className="cursor-pointer"
                  >
                    Specific products
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="categories" id="x_categories" />
                  <Label htmlFor="x_categories" className="cursor-pointer">
                    Products from categories
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {xSelectionType === "specific_products" && (
        <FormField
          control={control}
          name="xApplicableProducts"
          render={({ field }) => (
            <FormItem>
              <ProductSelector
                storeId={storeId}
                selectedProductIds={field.value || []}
                onSelectionChange={field.onChange}
                label="Select eligible X products"
                description="Choose which products customers need to purchase to qualify for this promotion"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {xSelectionType === "categories" && (
        <FormField
          control={control}
          name="xApplicableCategories"
          render={({ field }) => (
            <FormItem>
              <CategorySelector
                storeId={storeId}
                selectedCategoryIds={field.value || []}
                onSelectionChange={field.onChange}
                label="Select eligible X categories"
                description="Choose which product categories customers need to purchase from to qualify for this promotion"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
