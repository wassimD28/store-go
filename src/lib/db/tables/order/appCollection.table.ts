import { decimal, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { AppOrder } from "./appOrder.table";
import { relations } from "drizzle-orm";

export const AppCollection = pgTable("app_collection", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  quantity: integer("quantity").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Define relations for AppCollection
export const AppCollectionRelations = relations(AppCollection, ({ one }) => ({
  order: one(AppOrder, {
    fields: [AppCollection.order_id],
    references: [AppOrder.id],
  }),
}));
