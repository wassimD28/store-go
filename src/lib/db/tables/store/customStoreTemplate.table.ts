import { json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { stores } from "./store.table";
import { relations } from "drizzle-orm";
import { storeTemplate } from "./storeTemplate.table";

export const customStoreTemplate = pgTable("custom_store_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  storeId: uuid("storeId")
    .notNull()
    .references(() => stores.id),
  storeTemplateId: uuid("storeTemplateId")
    .notNull()
    .references(() => stores.id),
  name: varchar("name").notNull(),
  customTemplateConfig: json("template_config").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Define relations for the customStoreTemplate table
export const customStoreTemplateRelations = relations(customStoreTemplate, ({ one }) => ({
  user: one(user, {
    fields: [customStoreTemplate.userId],
    references: [user.id],
  }),
  store: one(stores, {
    fields: [customStoreTemplate.storeId],
    references: [stores.id],
  }),
  baseTemplate: one(storeTemplate, {
    fields: [customStoreTemplate.storeTemplateId],
    references: [storeTemplate.id],
  }),
}));
