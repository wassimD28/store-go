"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetClose,
} from "@/client/components/ui/sheet";
import { Button } from "@/client/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

// Import tab content components
import DetailsTabContent from "@/client/components/tabContent/products/details.tabContent";
import OrdersTabContent from "@/client/components/tabContent/products/orders.tabContent";
import ReviewsTabContent from "@/client/components/tabContent/products/reviews.tabContent";
import MessagesTabContent from "@/client/components/tabContent/products/messages.tabContent";

// Product interface based on your existing schema
interface ProductViewProps {
  product: {
    id: string;
    storeId: string;
    name: string;
    description: string | null;
    price: string;
    stock_quantity: number;
    categoryId: string;
    subcategoryId: string | null;
    image_urls: string[];
    created_at: Date;
    updated_at: Date;
    attributes?: Record<string, string>;
  };
  categoryName?: string;
  subcategoryName?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductViewSheet({
  product,
  categoryName,
  subcategoryName,
  isOpen,
  onOpenChange,
}: ProductViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");

  // Handle edit button click
  const handleEdit = () => {
    router.push(`/stores/${product.storeId}/products/edit/${product.id}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto rounded-l-2xl px-0 sm:max-w-md md:max-w-lg lg:max-w-3xl">
        <SheetHeader className="flex items-center justify-between px-3">
          <div className="flex w-full justify-between">
            <SheetClose asChild>
              <Button variant="ghost" size="sm">
                ×
              </Button>
            </SheetClose>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </div>
          </div>
        </SheetHeader>
        <hr className="mt-2" />

        <div>
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent">
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="details"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="orders"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="reviews"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="messages"
              >
                Messages
              </TabsTrigger>
            </TabsList>
            <hr />

            <TabsContent value="details" className="py-4">
              <DetailsTabContent
                product={product}
                categoryName={categoryName}
                subcategoryName={subcategoryName}
              />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTabContent productId={product.id} />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsTabContent productId={product.id} />
            </TabsContent>

            <TabsContent value="messages">
              <MessagesTabContent productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
