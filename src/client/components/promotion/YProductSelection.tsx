
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

interface YProductSelectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  storeId: string;
}

export default function YProductSelection({
  control,
  storeId,
}: YProductSelectionProps) {
  const ySelectionType = useWatch({
    control,
    name: "ySelectionType",
    defaultValue: "same_product",
  });

 
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="ySelectionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Which products can be the free/discounted items?
            </FormLabel>
            <FormDescription className="flex items-center gap-1">
              Choose how to determine which products customers can receive as
              their &quot;Y&quot; items
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      <strong>Same product only:</strong> Customers must get the
                      same product that they bought (e.g., buy 2, get 1 free of
                      the same product)
                    </p>
                    <p>
                      <strong>Specific products:</strong> Choose particular
                      products that can be received as free/discounted items
                    </p>
                    <p>
                      <strong>Products from categories:</strong> Any product
                      from the selected categories can be received as
                      free/discounted items
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
                  <RadioGroupItem value="same_product" id="same_product" />
                  <Label htmlFor="same_product" className="cursor-pointer">
                    Same product only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="specific_products"
                    id="specific_products"
                  />
                  <Label htmlFor="specific_products" className="cursor-pointer">
                    Specific products
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="categories" id="categories" />
                  <Label htmlFor="categories" className="cursor-pointer">
                    Products from categories
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {ySelectionType === "specific_products" && (
        <FormField
          control={control}
          name="yApplicableProducts"
          render={({ field }) => (
            <FormItem>
              <ProductSelector
                storeId={storeId}
                selectedProductIds={field.value || []}
                onSelectionChange={field.onChange}
                label="Select eligible Y products"
                description="Choose which products customers can receive as their free or discounted items"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {ySelectionType === "categories" && (
        <FormField
          control={control}
          name="yApplicableCategories"
          render={({ field }) => (
            <FormItem>
              <CategorySelector
                storeId={storeId}
                selectedCategoryIds={field.value || []}
                onSelectionChange={field.onChange}
                label="Select eligible Y categories"
                description="Choose which categories customers can receive their free or discounted items from"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
