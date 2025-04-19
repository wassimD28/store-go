import { decimal, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { AppOrder } from "./appOrder.table";


export const AppPayment = pgTable("app_payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payment_date: timestamp("payment_date").defaultNow(),
  payment_method: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), 
});