import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { AppAddress } from "../customer/appAddress.table";
import { relations } from "drizzle-orm";
import { stores } from "../store";

export const AppOrder = pgTable("app_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .references(() => stores.id)
    .notNull(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  address_id: uuid("address_id")
    .notNull()
    .references(() => AppAddress.id),
  data_amount: decimal("data_amount", { precision: 10, scale: 2 }).notNull(),
  order_date: timestamp("order_date").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  payment_status: varchar("payment_status", { length: 50 }).notNull(),
});

// Define relations for AppOrder
export const AppOrderRelations = relations(AppOrder, ({ one }) => ({
  user: one(AppUser, {
    fields: [AppOrder.appUserId],
    references: [AppUser.id],
  }),
  address: one(AppAddress, {
    fields: [AppOrder.address_id],
    references: [AppAddress.id],
  }),
}));
