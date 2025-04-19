import {
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { stores } from "../store";
import { AppProduct } from "../product";
import { relations } from "drizzle-orm";

export const AppWishlist = pgTable("app_wishlist", {
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
  added_at: timestamp("added_at").defaultNow().notNull(),
});

// Define relations for AppWishlist
export const AppWishlistRelations = relations(AppWishlist, ({ one }) => ({
  product: one(AppProduct, {
    fields: [AppWishlist.product_id],
    references: [AppProduct.id],
  }),
  appUser: one(AppUser, {
    fields: [AppWishlist.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppWishlist.storeId],
    references: [stores.id],
  }),
  
}));