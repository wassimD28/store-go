import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { storeTemplateTypeEnum } from "../tables.enum";
import { relations } from "drizzle-orm";
import { customStoreTemplate } from "./customStoreTemplate.table";


export const storeTemplate = pgTable("store_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  storeType: storeTemplateTypeEnum("store_template_type").notNull(),
  templateConfig: json("template_config").default({}),
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