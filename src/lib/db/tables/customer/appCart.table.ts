import { integer, json, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { stores } from "../store";
import { AppProduct } from "../product";
import { relations } from "drizzle-orm";
export const AppCart = pgTable("app_cart", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  product_id: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  quantity: integer("quantity").notNull().default(1),
  variants: json("variants").default({}),
  added_at: timestamp("added_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define relations for AppCart
export const AppCartRelations = relations(AppCart, ({ one }) => ({
  product: one(AppProduct, {
    fields: [AppCart.product_id],
    references: [AppProduct.id],
  }),
  appUser: one(AppUser, {
    fields: [AppCart.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppCart.storeId],
    references: [stores.id],
  }),
}));