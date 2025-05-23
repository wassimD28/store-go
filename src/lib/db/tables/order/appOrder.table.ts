import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
  json,
  text,
} from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { relations } from "drizzle-orm";
import { stores } from "../store";
import { OrderItem } from "./orderItem.table";

export const AppOrder = pgTable("app_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .references(() => stores.id)
    .notNull(),
  // Fix: Ensure field name matches what we're using in repository
  appUserId: uuid("app_user_id") // This should match the repository usage
    .notNull()
    .references(() => AppUser.id),
  orderNumber: varchar("order_number", { length: 50 }),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  // Fix: Ensure decimal fields expect string values
  data_amount: decimal("data_amount", { precision: 10, scale: 2 }).notNull(),
  order_date: timestamp("order_date").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  payment_status: varchar("payment_status", { length: 50 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Remove the address relation from relations
export const AppOrderRelations = relations(AppOrder, ({ one, many }) => ({
  user: one(AppUser, {
    fields: [AppOrder.appUserId],
    references: [AppUser.id],
  }),
  // Remove this relation:
  // address: one(AppAddress, {
  //   fields: [AppOrder.address_id],
  //   references: [AppAddress.id],
  // }),
  store: one(stores, {
    fields: [AppOrder.storeId],
    references: [stores.id],
  }),
  items: many(OrderItem),
}));
