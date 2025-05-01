import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { stores } from "../store";
import { AppCategory } from "./appCategory.table";

export const AppSubCategory = pgTable("app_subcategory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  parentCategoryId: uuid("parent_category_id")
    .notNull()
    .references(() => AppCategory.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});