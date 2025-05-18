"use client";

import { ReactNode, useEffect } from "react";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/client/components/ui/avatar";
import { getProductForNotification } from "@/app/actions/product.actions";

interface PusherProviderProps {
  children: ReactNode;
  storeId?: string;
}

export const PusherProvider = ({ children, storeId }: PusherProviderProps) => {
  const router = useRouter();

  useEffect(() => {
    // Only initialize Pusher if we have a storeId
    if (!storeId) return;

    // Initialize Pusher client
    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to the store channel
    const channel = client.subscribe(`store-${storeId}`); // Listen for new review events with product avatar
    channel.bind(
      "new-review",
      async (data: {
        productId: string;
        reviewId: string;
        rating: number;
        appUserId: string;
      }) => {
        try {
          // Get product details to display product image in the review notification
          const productDetails = await getProductForNotification(
            data.productId,
            storeId,
          );

          // Create the notification with product avatar
          toast.success(
            <Link
              href={`/stores/${storeId}/products/list?productId=${data.productId}&tab=reviews`}
              className="flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 border border-gray-200">
                {productDetails.success && productDetails.data.image ? (
                  <AvatarImage
                    src={productDetails.data.image}
                    alt={productDetails.data.name}
                  />
                ) : (
                  <AvatarFallback className="bg-gray-600 text-yellow-800">
                    ⭐
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">New review received!</span>
                <span>
                  {productDetails.success
                    ? productDetails.data.name
                    : "A product"}{" "}
                  received a {data.rating}-star review
                </span>
              </div>
            </Link>,
            {
              duration: 5000,
              position: "bottom-right",
              icon: null,
            },
          );
        } catch (error) {
          // Fallback to simpler notification if fetching product details fails
          console.error("Error fetching product details for review:", error);
          toast.success(
            <Link
              href={`/stores/${storeId}/products/list?productId=${data.productId}&tab=reviews`}
              className="flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 border border-gray-200">
                <AvatarFallback className="bg-yellow-100 text-yellow-800">
                  ⭐
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">New review received!</span>
                <span>A product received a {data.rating}-star review</span>
              </div>
            </Link>,
            {
              duration: 5000,
              position: "bottom-right",
              icon: null,
            },
          );
        }
      },
    );

    // Listen for new user sign-up events
    channel.bind(
      "new-user",
      async (data: { userId: string; name: string; email: string }) => {
        // Create notification for new user signup
        toast.success(
          <Link
            href={`/stores/${storeId}/customers`}
            className="flex items-center gap-3"
          >
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarFallback className="bg-blue-100 text-blue-800">
                👤
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">New user registered!</span>
              <span>{data.name} has joined your app</span>
            </div>
          </Link>,
          {
            duration: 5000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    );

    // You can add more notification types here following the same pattern

    // Cleanup on unmount
    return () => {
      if (client) {
        channel.unbind_all();
        client.unsubscribe(`store-${storeId}`);
        client.disconnect();
      }
    };
  }, [storeId, router]);

  return <>{children}</>;
};
