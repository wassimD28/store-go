import { Control } from "react-hook-form";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/client/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { CardHeader, CardContent } from "@/client/components/ui/card";
import { DiscountType } from "@/lib/types/enums/common.enum";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";

interface DiscountTypeSectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
}

export default function DiscountTypeSection({
  control,
}: DiscountTypeSectionProps) {
  return (
    <>
      <CardHeader className="text-xl font-semibold">Discount Type</CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectGroup>
                      <SelectItem value={DiscountType.Percentage}>
                        Percentage Discount
                      </SelectItem>
                      <SelectItem value={DiscountType.FixedAmount}>
                        Fixed Amount Discount
                      </SelectItem>
                      <SelectItem value={DiscountType.FreeShipping}>
                        Free Shipping
                      </SelectItem>
                      <SelectItem value={DiscountType.BuyXGetY}>
                        Buy X Get Y
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Choose how the discount will be applied to products.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}
