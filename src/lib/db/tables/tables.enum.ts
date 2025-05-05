import { pgEnum } from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "out_of_stock",
  "archived",
]);
export const AgeRangeEnum = pgEnum("age_range_enum", [
  "13-18",
  "19-25",
  "26-35",
  "36-45",
  "46-60",
  "60+",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
  "buy_x_get_y",
]);
export const storeTemplateTypeEnum = pgEnum("store_template_type", [
  "fashion",
  "electronic",
  "shoes"
]);



// For store owner notifications
export const storeNotificationTypeEnum = pgEnum("store_notification_type", [
  "new_review",
  "new_order",
  "product_out_of_stock",
  "order_status_change",
  "payment_received",
  "promotion_created",
  "low_inventory",
  "high_traffic_alert",
  "sales_milestone",
  "new_app_user_registration",
  "abandoned_cart",
  "refund_request",
  "customer_support_inquiry",
  "order_fulfillment_delay",
  "security_alert",
  "app_usage_analytics",
]);

export const appNotificationTypeEnum = pgEnum("app_user_notification_type", [
  "order_status_update",
  "delivery_update",
  "payment_confirmation",
  "price_drop",
  "back_in_stock",
  "new_promotion",
  "order_shipped",
  "review_reminder",
  "welcome_message",
  "cart_reminder",
  "personalized_offer",
  "return_status_update",
  "new_product",
]);



export const targetGenderEnum = pgEnum("target_gender", [
  "male",
  "female",
  "unisex",
]);
export const AppUserAuthType = pgEnum("app_user_auth_type", [
  "email_password",
  "oauth",
]);