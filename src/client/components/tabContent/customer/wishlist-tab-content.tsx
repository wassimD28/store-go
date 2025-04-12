"use client";

import { useEffect, useState } from "react";
import { getCustomerWishlist } from "@/app/actions/customer.actions";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Card, CardContent } from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import Image from "next/image";

interface WishlistTabContentProps {
  userId: string;
  storeId: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_urls: string[];
}

interface WishlistItem {
  id: string;
  storeId: string;
  appUserId: string;
  product_id: string;
  added_at: Date;
  product: Product;
}

export function WishlistTabContent({
  userId,
}: WishlistTabContentProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getCustomerWishlist(userId);
        if (response.success && response.data) {
          setWishlistItems(response.data);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericAmount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No wishlist items found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="space-y-4">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start p-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  {item.product?.image_urls?.[0] ? (
                    <Image
                      src={item.product.image_urls[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {item.product.description || "No description available"}
                  </p>
                  <p className="mt-1 font-medium text-primary">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
              </div>
              <div className="bg-muted/20 px-4 py-2 text-xs">
                <p className="text-muted-foreground">
                  Added on {new Date(item.added_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
