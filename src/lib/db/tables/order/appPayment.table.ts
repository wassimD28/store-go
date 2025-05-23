import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AppOrder } from "./appOrder.table";
import { relations } from "drizzle-orm";
import { stores } from "../store";
import { paymentStatusEnum } from "../tables.enum";

export const AppPayment = pgTable("app_payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .references(() => stores.id)
    .notNull(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(), // Add currency support
  payment_method: varchar("payment_method", { length: 50 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }), //This is critical for tracking payment status and handling webhooks.
  clientSecret: varchar("client_secret", { length: 255 }), // While this might be temporary during the payment process, it's useful for handling 3D Secure authentication.
  status: paymentStatusEnum("status").default("pending").notNull(), // Use enum
  // For tracking failed payments and providing meaningful feedback.
  errorMessage: varchar("error_message", { length: 255 }),
  errorCode: varchar("error_code", { length: 50 }),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(), // To prevent duplicate charges, which is essential for payment systems.
  payment_date: timestamp("payment_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for AppPayment
export const AppPaymentRelations = relations(AppPayment, ({ one }) => ({
  order: one(AppOrder, {
    fields: [AppPayment.order_id],
    references: [AppOrder.id],
  }),
}));
