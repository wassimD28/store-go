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
import { orderStatusEnum, paymentStatusEnum } from "../tables.enum";

export const AppOrder = pgTable("app_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .references(() => stores.id)
    .notNull(),
  appUserId: uuid("app_user_id") // This should match the repository usage
    .notNull()
    .references(() => AppUser.id),
  orderNumber: varchar("order_number", { length: 50 }),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  data_amount: decimal("data_amount", { precision: 10, scale: 2 }).notNull(),
  order_date: timestamp("order_date").defaultNow().notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  payment_status: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Remove the address relation from relations
export const AppOrderRelations = relations(AppOrder, ({ one, many }) => ({
  user: one(AppUser, {
    fields: [AppOrder.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppOrder.storeId],
    references: [stores.id],
  }),
  items: many(OrderItem),
}));
