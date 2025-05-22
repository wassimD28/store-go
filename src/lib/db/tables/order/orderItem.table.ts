import { decimal, integer, json, pgTable, uuid } from "drizzle-orm/pg-core";
import { AppOrder } from "./appOrder.table";
import { relations } from "drizzle-orm";
import { AppProduct } from "../product";

export const OrderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => AppProduct.id)
    .notNull(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  quantity: integer("quantity").notNull(),
  variants: json("variants").default({}),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Define relations for OrderItem
export const OrderItemRelations = relations(OrderItem, ({ one }) => ({
  order: one(AppOrder, {
    fields: [OrderItem.order_id],
    references: [AppOrder.id],
  }),
  product: one(AppProduct, {
    fields: [OrderItem.productId],
    references: [AppProduct.id],
  }),
}));
