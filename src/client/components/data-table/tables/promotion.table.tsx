"use client";

import { formatDate } from "@/lib/utils";
import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Button } from "@/client/components/ui/button";
import { Eye, Pencil, Tag } from "lucide-react";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/client/components/ui/badge";
import { DiscountType } from "@/lib/types/enums/common.enum";
import { PromotionViewSheet } from "@/client/components/sheet/promotion-view-sheet";

// Interface for promotions to be displayed in the table
interface Promotion {
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
}

interface PromotionTableClientProps {
  promotions: Promotion[];
}

export function PromotionTableClient({
  promotions,
}: PromotionTableClientProps) {
  const router = useRouter();
  const [viewPromotion, setViewPromotion] = useState<Promotion | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleViewPromotion = (promotion: Promotion) => {
    setViewPromotion(promotion);
    setIsViewOpen(true);
  };

  const formatDiscountValue = (promotion: Promotion) => {
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

  const columns: ColumnDef<Promotion>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const promotion = row.original;
        return <div className="font-medium">{promotion.name}</div>;
      },
      size: 200,
    },
    {
      accessorKey: "discountType",
      header: ({ column }) => (
        <SortableHeader column={column} title="Discount" />
      ),
      cell: ({ row }) => {
        const promotion = row.original;
        return (
          <div className="flex items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {formatDiscountValue(promotion)}
            </Badge>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <SortableHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("startDate")),
      size: 120,
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <SortableHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("endDate")),
      size: 120,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        const now = new Date();
        const endDate = new Date(row.original.endDate);
        const startDate = new Date(row.original.startDate);

        let status = "Inactive";
        let variant: "outline" | "default" | "destructive" | "secondary" =
          "outline";

        if (isActive) {
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
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const promotion = row.original;
        return (
          <div className="flex items-center gap-3">
            {" "}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewPromotion(promotion)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(
                  `/stores/${promotion.storeId}/promotions/${promotion.id}/edit`,
                )
              }
              title="Edit promotion"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      size: 100,
      enableSorting: false,
    },
  ];
  return (
    <>
      <DataTable
        data={promotions}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Filter promotions..."
        initialVisibility={{
          description: false,
          created_at: false,
          updated_at: false,
        }}
      />

      {viewPromotion && (
        <PromotionViewSheet
          promotion={viewPromotion}
          isOpen={isViewOpen}
          onOpenChange={setIsViewOpen}
        />
      )}
    </>
  );
}
