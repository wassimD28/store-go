import { json, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { stores } from "../store";
import { relations } from "drizzle-orm";
import { CartItem } from "./cartItem.table";

export const AppCart = pgTable("app_cart", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  status: json("status").default("active"),
  coupon_code: json("coupon_code"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define relations for AppCart
export const AppCartRelations = relations(AppCart, ({ one, many }) => ({
  appUser: one(AppUser, {
    fields: [AppCart.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppCart.storeId],
    references: [stores.id],
  }),
  items: many(CartItem),
}));
