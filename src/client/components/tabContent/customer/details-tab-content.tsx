"use client";

import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Card, CardContent } from "@/client/components/ui/card";
import { useEffect, useState } from "react";
import { getCustomerActivitySummary } from "@/app/actions/customer.actions";

// Interface for user details
interface CustomerDetailsProps {
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
}

// Interface for activity summary
interface ActivitySummary {
  ordersCount: number;
  wishlistCount: number;
  reviewsCount: number;
}

export function DetailsTabContent({ user }: CustomerDetailsProps) {
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    ordersCount: 0,
    wishlistCount: 0,
    reviewsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch customer activity summary
  useEffect(() => {
    const fetchActivitySummary = async () => {
      try {
        const response = await getCustomerActivitySummary(user.id);
        if (response.success && response.data) {
          setActivitySummary(response.data);
        }
      } catch (error) {
        console.error("Error fetching customer activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivitySummary();
  }, [user.id]);

  return (
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
              <h3 className="text-sm text-muted-foreground">Gender:</h3>
              <p className="capitalize">{user.gender || "Not specified"}</p>
            </div>

            {/* Age Range */}
            <div>
              <h3 className="text-sm text-muted-foreground">Age Range:</h3>
              <p>{user.age_range || "Not specified"}</p>
            </div>

            {/* Authentication Type */}
            <div>
              <h3 className="text-sm text-muted-foreground">Auth Method:</h3>
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
              <h3 className="text-sm text-muted-foreground">Joined:</h3>
              <p>{formatDateTime(user.created_at)}</p>
            </div>

            {/* Last Updated */}
            <div>
              <h3 className="text-sm text-muted-foreground">Last Updated:</h3>
              <p>{formatDateTime(user.updated_at)}</p>
            </div>

            {/* Customer ID */}
            <div>
              <h3 className="text-sm text-muted-foreground">Customer ID:</h3>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="mb-4">
        <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
            <span className="text-xl font-semibold">
              {isLoading ? "..." : activitySummary.ordersCount}
            </span>
            <span className="text-sm text-muted-foreground">Orders</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
            <span className="text-xl font-semibold">
              {isLoading ? "..." : activitySummary.wishlistCount}
            </span>
            <span className="text-sm text-muted-foreground">Wishlist</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-4">
            <span className="text-xl font-semibold">
              {isLoading ? "..." : activitySummary.reviewsCount}
            </span>
            <span className="text-sm text-muted-foreground">Reviews</span>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
