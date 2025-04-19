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

// Define an enum for notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_review",
  "new_order",
  "product_out_of_stock",
  "order_status_change",
  "payment_received",
  "promotion_created",
  // Add other notification types as needed
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