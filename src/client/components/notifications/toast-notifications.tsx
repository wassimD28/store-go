import Link from "next/link";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/client/components/ui/avatar";

interface BaseToastNotificationProps {
  title: string;
  content: string;
  href: string;
  storeId?: string;
}

interface ReviewNotificationProps extends BaseToastNotificationProps {
  productImage?: string | null;
  productName?: string | null;
  rating?: number;
}

interface UserSignupNotificationProps extends BaseToastNotificationProps {
  userName?: string;
}

interface OrderNotificationProps extends BaseToastNotificationProps {
  orderNumber?: string;
}

interface PaymentNotificationProps extends BaseToastNotificationProps {
  orderNumber?: string;
  amount?: number;
}

interface PaymentFailedNotificationProps extends PaymentNotificationProps {
  errorMessage?: string;
}

export const ReviewToastNotification = ({
  title,
  content,
  href,
  productImage,
  productName,
}: Pick<
  ReviewNotificationProps,
  "title" | "content" | "href" | "productImage" | "productName"
> &
  Partial<ReviewNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      {productImage ? (
        <AvatarImage src={productImage} alt={productName || "Product"} />
      ) : (
        <AvatarFallback className="bg-yellow-100 text-yellow-800">
          ⭐
        </AvatarFallback>
      )}
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const UserSignupToastNotification = ({
  title,
  content,
  href,
}: Pick<UserSignupNotificationProps, "title" | "content" | "href"> &
  Partial<UserSignupNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-blue-100 text-blue-800">👤</AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const OrderToastNotification = ({
  title,
  content,
  href,
}: Pick<OrderNotificationProps, "title" | "content" | "href"> &
  Partial<OrderNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-green-100 text-green-800">
        📦
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const OrderStatusToastNotification = ({
  title,
  content,
  href,
}: Pick<OrderNotificationProps, "title" | "content" | "href"> &
  Partial<OrderNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-orange-100 text-orange-800">
        📋
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const PaymentSuccessToastNotification = ({
  title,
  content,
  href,
}: Pick<PaymentNotificationProps, "title" | "content" | "href"> &
  Partial<PaymentNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-emerald-100 text-emerald-800">
        💰
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const PaymentFailedToastNotification = ({
  title,
  content,
  href,
}: Pick<PaymentFailedNotificationProps, "title" | "content" | "href"> &
  Partial<PaymentFailedNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-red-100 text-red-800">❌</AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);

export const PaymentActionRequiredToastNotification = ({
  title,
  content,
  href,
}: Pick<PaymentNotificationProps, "title" | "content" | "href"> &
  Partial<PaymentNotificationProps>) => (
  <Link href={href} className="flex items-center gap-3">
    <Avatar className="h-10 w-10 border border-gray-200">
      <AvatarFallback className="bg-yellow-100 text-yellow-800">
        🔐
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span>{content}</span>
    </div>
  </Link>
);
