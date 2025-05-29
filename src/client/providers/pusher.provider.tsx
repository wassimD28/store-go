"use client";

import { ReactNode, useEffect } from "react";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getProductForNotification } from "@/app/actions/product.actions";
import {
  ReviewToastNotification,
  UserSignupToastNotification,
  OrderToastNotification,
  OrderStatusToastNotification,
  PaymentSuccessToastNotification,
  PaymentFailedToastNotification,
  PaymentActionRequiredToastNotification,
} from "@/client/components/notifications/toast-notifications";

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
            <ReviewToastNotification
              storeId={storeId}
              title="New review received!"
              content={`${
                productDetails.success ? productDetails.data.name : "A product"
              } received a ${data.rating}-star review`}
              href={`/stores/${storeId}/products/list?productId=${data.productId}&tab=reviews`}
              productImage={
                productDetails.success ? productDetails.data.image : undefined
              }
              productName={
                productDetails.success ? productDetails.data.name : undefined
              }
              rating={data.rating}
            />,
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
            <ReviewToastNotification
              storeId={storeId}
              title="New review received!"
              content={`A product received a ${data.rating}-star review`}
              href={`/stores/${storeId}/products/list?productId=${data.productId}&tab=reviews`}
              rating={data.rating}
            />,
            {
              duration: 5000,
              position: "bottom-right",
              icon: null,
            },
          );
        }
      },
    ); // Listen for new user sign-up events
    channel.bind(
      "new-user",
      async (data: { userId: string; name: string; email: string }) => {
        // Create notification for new user signup
        toast.success(
          <UserSignupToastNotification
            storeId={storeId}
            title="New user registered!"
            content={`${data.name} has joined your app`}
            href={`/stores/${storeId}/customers`}
            userName={data.name}
          />,
          {
            duration: 5000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    ); // Listen for new order events
    channel.bind(
      "new-order",
      async (data: {
        type: string;
        title: string;
        content: string;
        data: {
          orderId: string;
          orderNumber: string;
          totalAmount: number;
          customerInfo: {
            appUserId: string;
            city: string;
            state: string;
          };
        };
      }) => {
        toast.success(
          <OrderToastNotification
            storeId={storeId}
            title={data.title}
            content={data.content}
            href={`/stores/${storeId}/orders`}
            orderNumber={data.data.orderNumber}
          />,
          {
            duration: 5000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    );

    // Listen for order status change events
    channel.bind(
      "order-status-change",
      async (data: {
        type: string;
        title: string;
        content: string;
        data: {
          orderId: string;
          orderNumber: string;
          previousStatus: string;
          newStatus: string;
          totalAmount: number;
        };
      }) => {
        toast.success(
          <OrderStatusToastNotification
            storeId={storeId}
            title={data.title}
            content={data.content}
            href={`/stores/${storeId}/orders`}
            orderNumber={data.data.orderNumber}
          />,
          {
            duration: 5000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    );

    // Listen for payment received events
    channel.bind(
      "payment-received",
      async (data: {
        type: string;
        title: string;
        content: string;
        data: {
          orderId: string;
          orderNumber: string;
          paymentAmount: number;
          paymentIntentId: string;
          paymentStatus: string;
        };
      }) => {
        toast.success(
          <PaymentSuccessToastNotification
            storeId={storeId}
            title={data.title}
            content={data.content}
            href={`/stores/${storeId}/orders`}
            orderNumber={data.data.orderNumber}
            amount={data.data.paymentAmount}
          />,
          {
            duration: 5000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    );

    // Listen for payment failed events
    channel.bind(
      "payment-failed",
      async (data: {
        type: string;
        title: string;
        content: string;
        data: {
          orderId: string;
          orderNumber: string;
          paymentAmount: number;
          paymentIntentId: string;
          paymentStatus: string;
          errorMessage: string;
          errorCode: string;
        };
      }) => {
        toast.error(
          <PaymentFailedToastNotification
            storeId={storeId}
            title={data.title}
            content={data.content}
            href={`/stores/${storeId}/orders`}
            orderNumber={data.data.orderNumber}
            amount={data.data.paymentAmount}
            errorMessage={data.data.errorMessage}
          />,
          {
            duration: 6000,
            position: "bottom-right",
            icon: null,
          },
        );
      },
    );

    // Listen for payment requires action events
    channel.bind(
      "payment-requires-action",
      async (data: {
        type: string;
        title: string;
        content: string;
        data: {
          orderId: string;
          orderNumber: string;
          paymentAmount: number;
          paymentIntentId: string;
          paymentStatus: string;
        };
      }) => {
        toast(
          <PaymentActionRequiredToastNotification
            storeId={storeId}
            title={data.title}
            content={data.content}
            href={`/stores/${storeId}/orders`}
            orderNumber={data.data.orderNumber}
            amount={data.data.paymentAmount}
          />,
          {
            duration: 6000,
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
