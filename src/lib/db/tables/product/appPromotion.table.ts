import {
  boolean,
  decimal,
  integer,
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
import {
  PromotionProduct,
  PromotionCategory,
  PromotionYProduct,
  PromotionYCategory,
} from "./promotionRelations.table";

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
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(), // Amount or percentage off
  couponCode: varchar("coupon_code", { length: 50 }), // Optional coupon code
  minimumPurchase: decimal("minimum_purchase", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(), // Minimum order value
  buyQuantity: integer("buy_quantity"), // for by_x_get_y option
  getQuantity: integer("get_quantity"), // for by_x_get_y option
  sameProductOnly: boolean("same_product_only").default(true), // If true, Y must be same as X
  promotionImage: varchar("promotion_image", { length: 500 }),
  usageCount: integer("usage_count").default(0).notNull(), // Track how many times it's been used
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Removed JSON fields:
  // - applicableProducts
  // - applicableCategories
  // - yApplicableProducts
  // - yApplicableCategories
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const AppPromotionRelations = relations(
  AppPromotion,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [AppPromotion.storeId],
      references: [stores.id],
    }),
    user: one(user, {
      fields: [AppPromotion.userId],
      references: [user.id],
    }),
    // Relations to conjunction tables
    products: many(PromotionProduct),
    categories: many(PromotionCategory),
    yProducts: many(PromotionYProduct),
    yCategories: many(PromotionYCategory),
  }),
);
