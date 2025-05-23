import { integer, json, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { AppCart } from "./appCart.table";
import { AppProduct } from "../product";
import { relations } from "drizzle-orm";

export const CartItem = pgTable("cart_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => AppCart.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  quantity: integer("quantity").notNull().default(1),
  variants: json("variants").default({}),
  added_at: timestamp("added_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define relations for CartItem
export const CartItemRelations = relations(CartItem, ({ one }) => ({
  cart: one(AppCart, {
    fields: [CartItem.cartId],
    references: [AppCart.id],
  }),
  product: one(AppProduct, {
    fields: [CartItem.productId],
    references: [AppProduct.id],
  }),
}));
