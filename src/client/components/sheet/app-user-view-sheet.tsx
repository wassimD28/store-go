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
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { DetailsTabContent } from "../tabContent/customer/details-tab-content";
import { OrdersTabContent } from "../tabContent/customer/orders-tab-content";
import { WishlistTabContent } from "../tabContent/customer/wishlist-tab-content";
import { AddressesTabContent } from "../tabContent/customer/addresses-tab-content";

// AppUser interface based on your schema
interface AppUserViewSheetProps {
  user: {
    id: string;
    storeId: string;
    name: string;
    email: string;
    avatar?: string | null;
    gender?: string | null;
    age_range?: string | null;
    auth_type: string;
    auth_provider?: string | null;
    status: boolean;
    created_at: Date;
    updated_at: Date;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppUserViewSheet({
  user,
  isOpen,
  onOpenChange,
}: AppUserViewSheetProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");

  // Handle edit button click
  const handleEdit = () => {
    router.push(`/stores/${user.storeId}/customers/${user.id}/edit`);
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
                Edit Customer
              </Button>
            </div>
          </div>
        </div>
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
                value="wishlist"
              >
                Wishlist
              </TabsTrigger>
              <TabsTrigger
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                value="addresses"
              >
                Addresses
              </TabsTrigger>
            </TabsList>
            <hr />

            <TabsContent value="details" className="py-4">
              <DetailsTabContent user={user} />
            </TabsContent>

            <TabsContent value="orders" className="px-4 py-4">
              <OrdersTabContent userId={user.id} storeId={user.storeId} />
            </TabsContent>

            <TabsContent value="wishlist" className="px-4 py-4">
              <WishlistTabContent userId={user.id} storeId={user.storeId} />
            </TabsContent>

            <TabsContent value="addresses" className="px-4 py-4">
              <AddressesTabContent userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
