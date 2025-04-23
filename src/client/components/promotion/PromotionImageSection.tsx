import { Control } from "react-hook-form";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/client/components/ui/form";
import { CardHeader, CardContent } from "@/client/components/ui/card";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import ImageKitUploader from "../uploader/imageKitUploader";

interface PromotionImageSectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
}

export default function PromotionImageSection({
  control,
}: PromotionImageSectionProps) {
  return (
    <>
      <CardHeader className="text-xl font-semibold">Promotion Image</CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="promotionImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion Banner Image</FormLabel>
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
    </>
  );
}
