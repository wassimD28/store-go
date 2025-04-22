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
import { formatTimeDifference } from "@/lib/utils";
import { getAllNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/app/actions/storeNotification.actions";
import { storeNotificationTypeEnum } from "@/lib/db/schema";

// Define types based on your app schema
type StoreNotificationType = (typeof storeNotificationTypeEnum.enumValues)[number];


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
    });

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
      const response = await markAllNotificationsAsRead(storeId)

      if (!response.success) throw new Error("Failed to mark notifications as read");

      // Update local state
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
      // Only make API call if notification is unread
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id)
      }

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id
            ? { ...n, isRead: true, readAt: new Date() }
            : n,
        ),
      );

      // Navigate based on notification type
      if (notification.type === "new_review" && notification.data.productId) {
        router.push(
          `/stores/${storeId}/products/list?productId=${notification.data.productId}&tab=reviews`,
        );
      } else if (
        notification.type === "new_order" &&
        notification.data.orderId
      ) {
        router.push(`/stores/${storeId}/orders/${notification.data.orderId}`);
      }
      // Add other navigation logic for different notification types
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to determine notification icon based on type
  const getNotificationIcon = (type: StoreNotificationType) => {
    switch (type) {
      case "new_review":
        return "⭐";
      case "new_order":
        return "🛒";
      case "product_out_of_stock":
        return "⚠️";
      case "payment_received":
        return "💰";
      default:
        return "📣";
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
            <Badge className="absolute -top-2 left-full min-w-4 max-h-5 text-xs -translate-x-1/2 flex-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-h-[70vh] w-80 overflow-auto p-1 mr-2">
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
            <div
              key={notification.id}
              className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <div className="relative flex items-start gap-3 pe-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                  <span className="text-lg" aria-hidden="true">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <button
                    className="text-left text-foreground/80 after:absolute after:inset-0"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="font-medium text-foreground">
                      {notification.title}
                    </span>
                    <div className="text-foreground/80">
                      {notification.content}
                    </div>
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeDifference(notification.createdAt)}
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="absolute end-0 self-center">
                    <svg
                      width="6"
                      height="6"
                      fill="currentColor"
                      viewBox="0 0 6 6"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
