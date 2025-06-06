import {
  boolean,
  decimal,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { stores } from "../store";
import { user } from "../auth";
import { discountTypeEnum } from "../tables.enum";
import { relations } from "drizzle-orm";

export const AppPromotion = pgTable("app_promotion", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(), // percentage, fixed_amount, free_shipping, buy_x_get_y
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }), // Amount or percentage off
  couponCode: varchar("coupon_code", { length: 50 }), // Optional coupon code
  minimumPurchase: decimal("minimum_purchase", {
    precision: 10,
    scale: 2,
  }).default("0"), // Minimum order value
  buyQuantity: integer("buy_quantity"), // for by_x_get_y option 
  getQuantity: integer("get_quantity"), // for by_x_get_y option
  yApplicableProducts: json("y_applicable_products").default([]), // Products that can be "Y" items
  yApplicableCategories: json("y_applicable_categories").default([]), // Categories that can be "Y" items
  sameProductOnly: boolean("same_product_only").default(true), // If true, Y must be same as X
  promotionImage: varchar("promotion_image", { length: 500 }),
  usageCount: integer("usage_count").default(0), // Track how many times it's been used
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  applicableProducts: json("applicable_products").default([]), // Array of product IDs
  applicableCategories: json("applicable_categories").default([]), // Array of category IDs
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const AppPromotionRelations = relations(AppPromotion, ({ one }) => ({
  store: one(stores, {
    fields: [AppPromotion.storeId],
    references: [stores.id],
  }),
}));
