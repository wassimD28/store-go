"use client";

import { Card } from "@/client/components/ui/card";
import { DiscountType } from "@/lib/types/enums/common.enum";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { Tag, Calendar, PieChart } from "lucide-react";

interface DetailsTabContentProps {
  promotion: {
    id: string;
    storeId: string;
    name: string;
    description: string | null;
    discountType: string;
    discountValue: string;
    couponCode: string | null;
    minimumPurchase: string;
    promotionImage: string | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    buyQuantity: number | null;
    getQuantity: number | null;
    applicableProducts: string[];
    applicableCategories: string[];
    created_at: Date;
    updated_at: Date;
    usageCount: number;
  };
}

export default function DetailsTabContent({
  promotion,
}: DetailsTabContentProps) {
  // Format discount value based on type
  const formatDiscountValue = () => {
    switch (promotion.discountType) {
      case DiscountType.Percentage:
        return `${promotion.discountValue}%`;
      case DiscountType.FixedAmount:
        return `$${promotion.discountValue}`;
      case DiscountType.BuyXGetY:
        return `Buy ${promotion.buyQuantity}, Get ${promotion.getQuantity}`;
      case DiscountType.FreeShipping:
        return "Free Shipping";
      default:
        return promotion.discountValue;
    }
  };

  // Get discount type display text
  const getDiscountTypeDisplay = () => {
    switch (promotion.discountType) {
      case DiscountType.Percentage:
        return "Percentage Discount";
      case DiscountType.FixedAmount:
        return "Fixed Amount Discount";
      case DiscountType.FreeShipping:
        return "Free Shipping";
      case DiscountType.BuyXGetY:
        return "Buy X Get Y";
      default:
        return "Unknown";
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    const startDate = new Date(promotion.startDate);

    let status = "Inactive";
    let variant: "outline" | "default" | "destructive" | "secondary" =
      "outline";

    if (promotion.isActive) {
      if (now > endDate) {
        status = "Expired";
        variant = "destructive";
      } else if (now < startDate) {
        status = "Scheduled";
        variant = "secondary";
      } else {
        status = "Active";
        variant = "default";
      }
    }

    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 px-6 py-2">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">{promotion.name}</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <p>Created: {formatDate(promotion.created_at)}</p>
          <p>•</p>
          <p>Last Updated: {formatDate(promotion.updated_at)}</p>
        </div>
      </div>

      {promotion.promotionImage && (
        <div className="relative h-40 overflow-hidden rounded-md">
          <Image
            src={promotion.promotionImage}
            alt={promotion.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Discount Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{getDiscountTypeDisplay()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value</span>
              <span className="font-medium">{formatDiscountValue()}</span>
            </div>
            {promotion.couponCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coupon Code</span>
                <span className="rounded-sm bg-muted px-2 py-0.5 font-mono">
                  {promotion.couponCode}
                </span>
              </div>
            )}
            {Number(promotion.minimumPurchase) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Purchase</span>
                <span>${promotion.minimumPurchase}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Promotion Period</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{getStatusBadge()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span>{formatDate(promotion.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span>{formatDate(promotion.endDate)}</span>
            </div>
          </div>
        </Card>
      </div>

      {(promotion.applicableProducts.length > 0 ||
        promotion.applicableCategories.length > 0) && (
        <Card className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Applicability</h3>
          </div>
          <div className="space-y-3">
            {promotion.applicableProducts.length > 0 && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Applicable Products:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {promotion.applicableProducts.length} product
                    {promotion.applicableProducts.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            )}

            {promotion.applicableCategories.length > 0 && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Applicable Categories:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {promotion.applicableCategories.length} categor
                    {promotion.applicableCategories.length !== 1 ? "ies" : "y"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {promotion.description && (
        <Card className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Description</h3>
          <p className="text-sm">{promotion.description}</p>
        </Card>
      )}
    </div>
  );
}
