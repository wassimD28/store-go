import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { storeCategory } from "./storeCategory.table";
import { relations } from "drizzle-orm";

// Define a stores table (simplified)
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => storeCategory.id),
  name: varchar("name", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  appUrl: varchar("app_url", { length: 500 }),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storesRelations = relations(stores, ({ one }) => ({
  category: one(storeCategory, {
    fields: [stores.categoryId],
    references: [storeCategory.id],
  }),
}));