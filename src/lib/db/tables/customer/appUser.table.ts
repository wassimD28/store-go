import {
  uuid,
  pgTable,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { stores } from "../store";
import { AgeRangeEnum, AppUserAuthType } from "../tables.enum";
import { relations } from "drizzle-orm";
export const AppUser = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  gender: varchar("gender", { length: 10 }),
  age_range: AgeRangeEnum("age_range"),
  auth_type: AppUserAuthType("auth_type").notNull().default("email_password"),
  auth_provider: varchar("auth_provider", { length: 50 }), // "google", "facebook", etc.
  provider_user_id: varchar("provider_user_id", { length: 255 }), // ID from the provider
  is_online: boolean("is_online").default(false),
  last_seen: timestamp("last_seen"),
  status: boolean("status").default(true),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define relations for AppUser
export const AppUserRelations = relations(AppUser, ({ one }) => ({
  store: one(stores, {
    fields: [AppUser.storeId],
    references: [stores.id],
  }),
}));
