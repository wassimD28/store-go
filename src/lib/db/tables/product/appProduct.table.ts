import {
  uuid,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { stores } from "../store";
import { AppCategory } from "./appCategory.table";
import { AppSubCategory } from "./appSubcategory.table";
import { productStatusEnum, targetGenderEnum } from "../tables.enum";
import { relations } from "drizzle-orm";
import { AppReview } from "./appReview.table";

export const AppProduct = pgTable("app_product", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => AppCategory.id),
  subcategoryId: uuid("subcategory_id").references(() => AppSubCategory.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  attributes: json("attributes").default({}),
  colors: json("colors").default({}),
  size: json("size").default({}),
  image_urls: json("image_urls").default([]),
  stock_quantity: integer("stock_quantity").default(0).notNull(),
  status: productStatusEnum("status").default("draft").notNull(),
  targetGender: targetGenderEnum("target_gender").default("unisex").notNull(),
  unitsSold: integer("units_sold").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for AppProduct
export const AppProductRelations = relations(AppProduct, ({ one, many }) => ({
  category: one(AppCategory, {
    fields: [AppProduct.categoryId],
    references: [AppCategory.id],
  }),
  subcategory: one(AppSubCategory, {
    fields: [AppProduct.subcategoryId],
    references: [AppSubCategory.id],
  }),
  store: one(stores, {
    fields: [AppProduct.storeId],
    references: [stores.id],
  }),
  user: one(user, {
    fields: [AppProduct.userId],
    references: [user.id],
  }),
  // Ajout de la relation many vers les reviews
  reviews: many(AppReview),
}));
