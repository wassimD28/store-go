import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AppUser } from "../customer";
import { stores } from "../store";
import { relations } from "drizzle-orm";
export const AppAddress = pgTable("app_address", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  status: varchar("status", { length: 50 }).default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for AppAddress
export const AppAddressRelations = relations(AppAddress, ({ one, many }) => ({
  store: one(stores, {
    fields: [AppAddress.storeId],
    references: [stores.id],
  }),
  user: one(AppUser, {
    fields: [AppAddress.appUserId],
    references: [AppUser.id],
  }),
}));
