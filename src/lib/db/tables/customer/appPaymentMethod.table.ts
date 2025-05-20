import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { stores } from "../store";
import { relations } from "drizzle-orm";

export const AppPaymentMethod = pgTable("app_payment_method", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  type: varchar("type", { length: 50 }).notNull(), // credit_card, paypal, etc.
  isDefault: boolean("is_default").default(false),
  // Store last 4 digits, brand, expiry, etc. but not full card details
  details: jsonb("details").default({}),
  // Store the payment token from Stripe (or any provider)
  paymentToken: varchar("payment_token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for AppPaymentMethod
export const AppPaymentMethodRelations = relations(
  AppPaymentMethod,
  ({ one }) => ({
    user: one(AppUser, {
      fields: [AppPaymentMethod.appUserId],
      references: [AppUser.id],
    }),
    store: one(stores, {
      fields: [AppPaymentMethod.storeId],
      references: [stores.id],
    }),
  }),
);
