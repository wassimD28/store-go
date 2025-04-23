"use client";

import { useWatch } from "react-hook-form";
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
import { Input } from "@/client/components/ui/input";
import { DiscountType } from "@/lib/types/enums/common.enum";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/client/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { createPromotionSchema } from "../forms/promotion/createPromotionForm";
import { CardContent, CardHeader } from "../ui/card";

interface DiscountDetailsProps {
  control: Control<z.infer<typeof createPromotionSchema>>;
  currency: string;
}

export default function DiscountDetails({
  control,
  currency,
}: DiscountDetailsProps) {
  const discountType = useWatch({
    control,
    name: "discountType",
  });

  return (
    <>
      <CardHeader className="text-xl font-semibold">
        Discount Details
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {discountType === DiscountType.BuyXGetY ? (
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buy Quantity (X)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Customer needs to buy this many items
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="getQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Quantity (Y)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Customer gets this many items free
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buy Quantity (X)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="getQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Get Quantity (Y)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount on Y Items (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="100"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 100)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage discount on the Y items (100% means free)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <FormField
            control={control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      disabled={discountType === DiscountType.FreeShipping}
                      className={cn(
                        "relative",
                        discountType === DiscountType.Percentage && "pr-8",
                        discountType === DiscountType.FixedAmount && "pl-12",
                      )}
                    />
                  </FormControl>
                  {discountType === DiscountType.Percentage && (
                    <div className="absolute right-3">%</div>
                  )}
                  {discountType === DiscountType.FixedAmount && (
                    <div className="absolute left-3">{currency}</div>
                  )}
                </div>
                <FormDescription>
                  {discountType === DiscountType.Percentage
                    ? "Enter percentage value (e.g., 10 for 10%)"
                    : discountType === DiscountType.FixedAmount
                      ? `Enter amount value in ${currency}`
                      : discountType === DiscountType.FreeShipping
                        ? "No discount value needed for free shipping"
                        : "Enter value as per discount type"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="pl-4 border-l border-border">
          <FormField
            control={control}
            name="couponCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="SUMMER25"
                    type="text"
                    {...field}
                    value={field.value || ""}
                    className="uppercase"
                  />
                </FormControl>
                <FormDescription className="flex items-center gap-1">
                  If left empty, the discount will apply automatically
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Enter a unique code that customers will need to enter
                          during checkout to apply this promotion.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="minimumPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Purchase (Optional)</FormLabel>
                <div className="relative">
                  <div className="absolute left-3 flex h-full items-center text-muted-foreground">
                    {currency}
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      className="pl-12"
                      placeholder="50"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                </div>
                <FormDescription className="flex items-center gap-1">
                  Minimum order amount required to apply this promotion
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          If set, customers must spend at least this amount before
                          the promotion applies.
                        </p>
                        <p>Leave at 0 for no minimum purchase requirement.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </>
  );
}
