import {
  uuid,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores } from "../store";
import { AppProduct } from "./appProduct.table";
import { AppUser } from "../customer";
import { relations } from "drizzle-orm";

export const AppReview = pgTable("app_review", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const AppReviewsRelations = relations(AppReview, ({ one }) => ({
  product: one(AppProduct, {
    fields: [AppReview.productId],
    references: [AppProduct.id],
  }),
  appUser: one(AppUser, {
    fields: [AppReview.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppReview.storeId],
    references: [stores.id],
  }),
}));