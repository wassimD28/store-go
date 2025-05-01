"use client";

import { useEffect, useState } from "react";
import { getCustomerAddresses } from "@/app/actions/customer.actions";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Skeleton } from "@/client/components/ui/skeleton";
interface AddressesTabContentProps {
  userId: string;
}

interface Address {
  id: string;
  storeId:string;
  appUserId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean | null;
}

export function AddressesTabContent({ userId }: AddressesTabContentProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getCustomerAddresses(userId);
        if (response.success && response.data) {
          setAddresses(response.data);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No addresses found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
            
                  <div>
                    <div className="flex items-center space-x-2">
                      
                      {address.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm">
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.postalCode}
                    </p>
                    <p className="mt-0.5 text-sm">{address.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
