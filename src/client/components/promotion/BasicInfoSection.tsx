import { Control } from "react-hook-form";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { CardHeader, CardContent } from "@/client/components/ui/card";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";

interface BasicInfoSectionProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  title?: string;
}

export default function BasicInfoSection({
  control,
  title = "Create New Promotion",
}: BasicInfoSectionProps) {
  return (
    <>
      <CardHeader className="text-xl font-semibold">{title}</CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion Name</FormLabel>
              <FormControl>
                <Input placeholder="Summer Sale 2025" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
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
    </>
  );
}
