import { Control } from "react-hook-form";
import * as z from "zod";
import { CardHeader, CardContent } from "@/client/components/ui/card";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import XProductSelection from "./XProductSelection";
import YProductSelection from "./YProductSelection";

interface BuyXGetYSectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  storeId: string;
}

export default function BuyXGetYSection({
  control,
  storeId,
}: BuyXGetYSectionProps) {
  return (
    <>
      <CardHeader className="text-xl font-semibold">
        Buy X Get Y Configuration
      </CardHeader>
      <CardContent className="space-y-8">
        {/* "X" Product Selection */}
        <div className="rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">
            Step 1: Configure &quot;X&quot; Items (Items customers need to buy)
          </h3>
          <XProductSelection control={control} storeId={storeId} />
        </div>

        {/* "Y" Product Selection */}
        <div className="rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">
            Step 2: Configure &quot;Y&quot; Items (Items customers get
            discounted)
          </h3>
          <YProductSelection control={control} storeId={storeId} />
        </div>
      </CardContent>
    </>
  );
}
