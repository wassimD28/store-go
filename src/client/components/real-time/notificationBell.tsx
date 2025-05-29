/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/storeNotification.actions";
import { storeNotificationTypeEnum } from "@/lib/db/schema";
import {
  NotificationItem,
  createUserRegistrationNotification,
  createOrderNotification,
  createOrderStatusNotification,
  createPaymentReceivedNotification,
  createPaymentFailedNotification,
  createPaymentActionRequiredNotification,
} from "@/client/components/notifications/notification-components";

// Define types based on your app schema
type StoreNotificationType =
  (typeof storeNotificationTypeEnum.enumValues)[number];

interface Notification {
  id: string;
  storeId: string;
  type: StoreNotificationType;
  title: string;
  content: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}

// Props for the component to receive storeId and userId
interface NotificationBellProps {
  storeId: string;
}

export function NotificationBell({ storeId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllNotifications(storeId);
        if (!response.success) throw new Error("Failed to fetch notifications");

        const transformedData = response.data.map((notification) => ({
          ...notification,
          data: notification.data as Record<string, any>,
        }));

        setNotifications(transformedData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // You could also set an error state here if needed
      } finally {
        setLoading(false); // Always set loading to false
      }
    };

    if (storeId) {
      fetchNotifications();
    }
  }, [storeId]);
  // Set up Pusher real-time listener
  useEffect(() => {
    if (!storeId) return;

    // Initialize Pusher client
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn(
        "Pusher configuration missing. Real-time notifications disabled.",
      );
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    // Subscribe to the store channel
    const channel = pusher.subscribe(`store-${storeId}`);

    // Listen for new notifications
    channel.bind("new-notification", (newNotification: Notification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    }); // Listen for new user registration events
    channel.bind(
      "new-user",
      (data: { userId: string; name: string; email: string }) => {
        // Create a notification object for the new user
        const newUserNotification = createUserRegistrationNotification(
          storeId,
          data,
        );

        // Add to notifications state
        setNotifications((prev) => [newUserNotification, ...prev]);
      },
    ); // Listen for new order events
    channel.bind(
      "new-order",
      (data: {
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
        const newOrderNotification = createOrderNotification(storeId, data);
        setNotifications((prev) => [newOrderNotification, ...prev]);
      },
    ); // Listen for order status change events
    channel.bind(
      "order-status-change",
      (data: {
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
        const orderStatusNotification = createOrderStatusNotification(
          storeId,
          data,
        );
        setNotifications((prev) => [orderStatusNotification, ...prev]);
      },
    ); // Listen for payment received events
    channel.bind(
      "payment-received",
      (data: {
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
        const paymentReceivedNotification = createPaymentReceivedNotification(
          storeId,
          data,
        );
        setNotifications((prev) => [paymentReceivedNotification, ...prev]);
      },
    ); // Listen for payment failed events
    channel.bind(
      "payment-failed",
      (data: {
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
        const paymentFailedNotification = createPaymentFailedNotification(
          storeId,
          data,
        );
        setNotifications((prev) => [paymentFailedNotification, ...prev]);
      },
    ); // Listen for payment requires action events
    channel.bind(
      "payment-requires-action",
      (data: {
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
        const paymentActionNotification =
          createPaymentActionRequiredNotification(storeId, data);
        setNotifications((prev) => [paymentActionNotification, ...prev]);
      },
    );

    // Clean up on unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`store-${storeId}`);
      pusher.disconnect();
    };
  }, [storeId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const handleMarkAllAsRead = async () => {
    try {
      // Filter out temporary notifications that don't exist in the database
      const persistedNotifications = notifications.filter(
        (n) => !n.id.startsWith("temp-"),
      );

      // Only make API call if there are any persisted notifications
      if (persistedNotifications.length > 0) {
        const response = await markAllNotificationsAsRead(storeId);
        if (!response.success) {
          throw new Error("Failed to mark notifications as read");
        }
      }

      // Update local state for all notifications (including temporary ones)
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date(),
        })),
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Only make API call if notification is unread and has a valid DB ID (not temporary)
      if (!notification.isRead && !notification.id.startsWith("temp-")) {
        await markNotificationAsRead(notification.id);
      }

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id
            ? { ...n, isRead: true, readAt: new Date() }
            : n,
        ),
      ); // Navigate based on notification type
      if (notification.type === "new_review" && notification.data.productId) {
        router.push(
          `/stores/${storeId}/products/list?productId=${notification.data.productId}&tab=reviews`,
        );
      } else if (
        notification.type === "new_order" &&
        notification.data.orderId
      ) {
        router.push(`/stores/${storeId}/orders`);
      } else if (
        notification.type === "order_status_change" &&
        notification.data.orderId
      ) {
        router.push(`/stores/${storeId}/orders`);
      } else if (
        notification.type === "payment_received" &&
        notification.data.orderId
      ) {
        router.push(`/stores/${storeId}/orders`);
      } else if (
        notification.type === "new_app_user_registration" &&
        notification.data.userId
      ) {
        router.push(`/stores/${storeId}/customers`);
      }
      // Add other navigation logic for different notification types
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell size={16} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="flex-center absolute -top-2 left-full max-h-5 min-w-4 -translate-x-1/2 text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="mr-2 max-h-[70vh] w-80 overflow-auto p-1"
      >
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
        ></div>

        {loading ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
