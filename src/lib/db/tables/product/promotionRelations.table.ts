import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { AppPromotion } from "./appPromotion.table";
import { AppProduct } from "./appProduct.table";
import { AppCategory } from "./appCategory.table";

/**
 * Conjunction table for products eligible for the "X" part of a promotion
 * (i.e., products that the promotion directly applies to)
 */
export const PromotionProduct = pgTable("promotion_product", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Conjunction table for categories eligible for the "X" part of a promotion
 * (i.e., categories that the promotion directly applies to)
 */
export const PromotionCategory = pgTable("promotion_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => AppCategory.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Conjunction table for products eligible for the "Y" part of a Buy X Get Y promotion
 * (i.e., products that can be received as the discounted/free item)
 */
export const PromotionYProduct = pgTable("promotion_y_product", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Conjunction table for categories eligible for the "Y" part of a Buy X Get Y promotion
 * (i.e., categories that can be received as the discounted/free item)
 */
export const PromotionYCategory = pgTable("promotion_y_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => AppCategory.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations configurations
export const PromotionProductRelations = relations(
  PromotionProduct,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionProduct.promotionId],
      references: [AppPromotion.id],
    }),
    product: one(AppProduct, {
      fields: [PromotionProduct.productId],
      references: [AppProduct.id],
    }),
  }),
);

export const PromotionCategoryRelations = relations(
  PromotionCategory,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionCategory.promotionId],
      references: [AppPromotion.id],
    }),
    category: one(AppCategory, {
      fields: [PromotionCategory.categoryId],
      references: [AppCategory.id],
    }),
  }),
);

export const PromotionYProductRelations = relations(
  PromotionYProduct,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionYProduct.promotionId],
      references: [AppPromotion.id],
    }),
    product: one(AppProduct, {
      fields: [PromotionYProduct.productId],
      references: [AppProduct.id],
    }),
  }),
);

export const PromotionYCategoryRelations = relations(
  PromotionYCategory,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionYCategory.promotionId],
      references: [AppPromotion.id],
    }),
    category: one(AppCategory, {
      fields: [PromotionYCategory.categoryId],
      references: [AppCategory.id],
    }),
  }),
);
