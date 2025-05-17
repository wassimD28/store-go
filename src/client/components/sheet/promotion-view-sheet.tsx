"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetClose } from "@/client/components/ui/sheet";
import { Button } from "@/client/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { Pencil, X, Info, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

// Import tab content components
import DetailsTabContent from "@/client/components/tabContent/promotions/details.tabContent";
import ProductsTabContent from "@/client/components/tabContent/promotions/products.tabContent";

// Promotion interface based on your existing schema
interface PromotionViewProps {
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
    yApplicableProducts?: string[];
    yApplicableCategories?: string[];
    sameProductOnly?: boolean;
    created_at: Date;
    updated_at: Date;
    usageCount: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}

export function PromotionViewSheet({
  promotion,
  isOpen,
  onOpenChange,
  initialTab = "details",
}: PromotionViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle edit button click
  const handleEdit = () => {
    router.push(`/stores/${promotion.storeId}/promotions/edit/${promotion.id}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="h-full overflow-y-auto rounded-l-2xl px-0 sm:max-w-md md:max-w-lg [&>button]:hidden">
        <div className="flex items-center justify-between px-3 py-0">
          <div className="flex w-full justify-between">
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X />
              </Button>
            </SheetClose>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Promotion
              </Button>
            </div>
          </div>
        </div>
        <hr className="mt-2" />

        <div>
          {" "}
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            {" "}
            <TabsList className="bg-transparent">
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="details"
              >
                <Info className="mr-1 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="products"
              >
                <ShoppingBag className="mr-1 h-4 w-4" />
                Products
              </TabsTrigger>
            </TabsList>
            <hr />
            <TabsContent value="details" className="py-4">
              <DetailsTabContent promotion={promotion} />
            </TabsContent>
            <TabsContent value="products" className="py-4">
              <ProductsTabContent promotion={promotion} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
