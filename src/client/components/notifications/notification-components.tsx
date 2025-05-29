import { formatTimeDifference } from "@/lib/utils";
import { storeNotificationTypeEnum } from "@/lib/db/schema";

// Define types based on your app schema
type StoreNotificationType =
  (typeof storeNotificationTypeEnum.enumValues)[number];

interface BaseNotification {
  id: string;
  storeId: string;
  type: StoreNotificationType;
  title: string;
  content: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}

interface NotificationItemProps {
  notification: BaseNotification;
  onClick: (notification: BaseNotification) => void;
}

// Utility function to determine notification icon based on type
export const getNotificationIcon = (type: StoreNotificationType): string => {
  switch (type) {
    case "new_review":
      return "⭐";
    case "new_order":
      return "📦";
    case "order_status_change":
      return "📋";
    case "product_out_of_stock":
      return "⚠️";
    case "payment_received":
      return "💰";
    case "refund_request": // Used for payment failures
      return "❌";
    case "security_alert": // Used for payment requires action
      return "🔐";
    case "new_app_user_registration":
      return "👤";
    default:
      return "📣";
  }
};

// Reusable notification item component
export const NotificationItem = ({
  notification,
  onClick,
}: NotificationItemProps) => (
  <div className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent">
    <div className="relative flex items-start gap-3 pe-3">
      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
        <span className="text-lg" aria-hidden="true">
          {getNotificationIcon(notification.type)}
        </span>
      </div>
      <div className="flex-1 space-y-1">
        <button
          className="text-left text-foreground/80 after:absolute after:inset-0"
          onClick={() => onClick(notification)}
        >
          <span className="font-medium text-foreground">
            {notification.title}
          </span>
          <div className="text-foreground/80">{notification.content}</div>
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
);

// Factory functions to create notification objects
export const createUserRegistrationNotification = (
  storeId: string,
  data: { userId: string; name: string; email: string },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "new_app_user_registration",
  title: "New user registered",
  content: `${data.name} has joined your app`,
  data: {
    userId: data.userId,
    name: data.name,
    email: data.email,
  },
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});

export const createOrderNotification = (
  storeId: string,
  data: {
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
  },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "new_order",
  title: data.title,
  content: data.content,
  data: data.data,
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});

export const createOrderStatusNotification = (
  storeId: string,
  data: {
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
  },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "order_status_change",
  title: data.title,
  content: data.content,
  data: data.data,
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});

export const createPaymentReceivedNotification = (
  storeId: string,
  data: {
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
  },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "payment_received",
  title: data.title,
  content: data.content,
  data: data.data,
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});

export const createPaymentFailedNotification = (
  storeId: string,
  data: {
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
  },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "refund_request", // Using closest available type
  title: data.title,
  content: data.content,
  data: data.data,
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});

export const createPaymentActionRequiredNotification = (
  storeId: string,
  data: {
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
  },
): BaseNotification => ({
  id: `temp-${Date.now()}`,
  storeId,
  type: "security_alert", // Using closest available type
  title: data.title,
  content: data.content,
  data: data.data,
  isRead: false,
  createdAt: new Date(),
  readAt: null,
});
