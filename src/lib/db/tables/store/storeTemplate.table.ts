import { json, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { storeTemplateTypeEnum } from "../tables.enum";
import { relations } from "drizzle-orm";
import { customStoreTemplate } from "./customStoreTemplate.table";


export const storeTemplateStatusEnum = pgEnum('store_template_status', [
  'active',
  'inactive',
  'draft',
  'archived'
]);

export const storeTemplate = pgTable("store_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  storeType: storeTemplateTypeEnum("store_template_type").notNull(),
  description: text("description"),
  status: storeTemplateStatusEnum("status").default("inactive").notNull(),
  templateConfig: json("template_config").default({}),
  images: json("images").default([]).notNull().$type<string[]>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Define relations for the storeTemplate table
export const storeTemplateRelations = relations(storeTemplate, ({ one, many }) => ({
  user: one(user, {
    fields: [storeTemplate.userId],
    references: [user.id],
  }),
  customTemplates: many(customStoreTemplate),
}));