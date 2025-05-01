import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { relations } from "drizzle-orm";
import { stores } from "./store.table";
// Define store category table
export const storeCategory = pgTable("store_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 50 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const storeCategoryRelations = relations(storeCategory, ({ many }) => ({
  stores: many(stores),
}));