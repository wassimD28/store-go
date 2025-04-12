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
import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Card, CardContent } from "@/client/components/ui/card";

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

  // Format date helper function
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              <ScrollArea className="h-full px-4">
                <div className="flex flex-col items-center justify-center space-y-4 pb-4">
                  {/* User Avatar */}
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary/10">
                    <Image
                      src={user.avatar || "/unknown-user.svg"}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* User Name and Status */}
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold">{user.name}</h1>
                    <Badge
                      variant={user.status ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {user.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Email */}
                  <div className="w-full text-center">
                    <p className="break-all text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Gender */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Gender:
                        </h3>
                        <p className="capitalize">
                          {user.gender || "Not specified"}
                        </p>
                      </div>

                      {/* Age Range */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Age Range:
                        </h3>
                        <p>{user.age_range || "Not specified"}</p>
                      </div>

                      {/* Authentication Type */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Auth Method:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">
                            {user.auth_type.replace("_", " ")}
                          </Badge>
                          {user.auth_provider && (
                            <Badge className="bg-blue-100 capitalize text-blue-800">
                              {user.auth_provider}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Created At */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Joined:
                        </h3>
                        <p>{formatDateTime(user.created_at)}</p>
                      </div>

                      {/* Last Updated */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Last Updated:
                        </h3>
                        <p>{formatDateTime(user.updated_at)}</p>
                      </div>

                      {/* Customer ID */}
                      <div>
                        <h3 className="text-sm text-muted-foreground">
                          Customer ID:
                        </h3>
                        <p className="font-mono text-xs">{user.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card className="mb-4">
                  <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
                      <span className="text-xl font-semibold">0</span>
                      <span className="text-sm text-muted-foreground">
                        Orders
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
                      <span className="text-xl font-semibold">0</span>
                      <span className="text-sm text-muted-foreground">
                        Wishlist
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
                      <span className="text-xl font-semibold">0</span>
                      <span className="text-sm text-muted-foreground">
                        Reviews
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="orders" className="px-4 py-4">
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className="px-4 py-4">
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No wishlist items found</p>
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="px-4 py-4">
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No addresses found</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
