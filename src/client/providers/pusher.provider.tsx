"use client";

import { ReactNode, useEffect } from "react";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PusherProviderProps {
  children: ReactNode;
  storeId?: string;
  userId?: string;
}

export const PusherProvider = ({
  children,
  storeId,
  userId,
}: PusherProviderProps) => {
  const router = useRouter();

  useEffect(() => {
    // Only initialize Pusher if we have a storeId
    if (!storeId) return;

    // Initialize Pusher client
    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });


    // Subscribe to the store channel
    const channel = client.subscribe(`store-${storeId}`);

    // Listen for new review events
    channel.bind(
      "new-review",
      (data: {
        productId: string;
        reviewId: string;
        rating: number;
        userId: string;
      }) => {
        // Don't show notification for the user's own reviews
        if (data.userId === userId) return;

        toast.success(
          <Link
            href={`/stores/${storeId}/products/edit/${data.productId}?tab=reviews`}
            className="flex flex-col"
          >
            <span className="font-semibold">New review received!</span>
            <span>A product received a {data.rating}-star review</span>
          </Link>,
          {
            duration: 5000,
            position: "bottom-right",
            icon: "⭐",
          },
        );
      },
    );

    // Add more event listeners for other notification types
    // Example:
    // channel.bind("new-order", (data) => { ... });

    // Cleanup on unmount
    return () => {
      if (client) {
        channel.unbind_all();
        client.unsubscribe(`store-${storeId}`);
        client.disconnect();
      }
    };
  }, [storeId, userId, router]);

  return <>{children}</>;
};
