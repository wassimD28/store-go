"use client";

import { useEffect, useState } from "react";
import { getCustomerOrders } from "@/app/actions/customer.actions";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Skeleton } from "@/client/components/ui/skeleton";

// Define interfaces for the component props and data
interface OrdersTabContentProps {
  userId: string;
  storeId: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  id: string;
  storeId: string;
  appUserId: string;
  orderNumber: string | null;
  shippingAddress: Address | null; // JSON field from database
  billingAddress: Address | null; // JSON field from database
  paymentMethod: string | null;
  notes: string | null;
  data_amount: string;
  order_date: Date;
  status: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
}

export function OrdersTabContent({ userId }: OrdersTabContentProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getCustomerOrders(userId);
        if (response.success && response.data) {
          // Type assertion to handle the unknown address fields from the API
          setOrders(response.data as Order[]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Helper function to safely extract address information
  const formatAddress = (address: Address | null): string => {
    if (address && typeof address === "object") {
      const { street, city, state, postalCode, country } = address;
      const addressParts = [street, city, state, postalCode, country].filter(
        Boolean,
      );
      return addressParts.length > 0
        ? addressParts.join(", ")
        : "Address not available";
    }
    return "Address not available";
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericAmount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "delivered":
        return "default";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get payment status badge variant
  const getPaymentStatusBadgeVariant = (
    paymentStatus: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (paymentStatus.toLowerCase()) {
      case "paid":
      case "completed":
        return "default";
      case "pending":
      case "processing":
        return "secondary";
      case "failed":
      case "cancelled":
      case "refunded":
        return "destructive";
      case "unpaid":
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Order #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(order.data_amount)}
                    </p>{" "}
                  </div>
                  <div>
                    <p className="text-sm">Payment</p>
                    <Badge
                      variant={getPaymentStatusBadgeVariant(
                        order.payment_status,
                      )}
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="mt-4 rounded-md bg-muted/20 p-2 text-xs">
                    <p className="font-medium">Shipping Address:</p>
                    <p>{formatAddress(order.shippingAddress)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
