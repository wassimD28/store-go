import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { stores } from "./store.table";
import { relations } from "drizzle-orm";
import { storeTemplate } from "./storeTemplate.table";
import { generationJob } from "./generationJob.table";

export const builtTypeEnum = pgEnum("built_type", [
  "quick_build",
  "advanced_build",
]);

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
    .references(() => storeTemplate.id),
  name: varchar("name").notNull(),
  builtType: builtTypeEnum("built_type").notNull(),
  isBuilding: json("is_building").default(false).notNull(),
  isBuilt: json("is_built").default(false).notNull(),
  customTemplateConfig: json("template_config").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations for the customStoreTemplate table
export const customStoreTemplateRelations = relations(
  customStoreTemplate,
  ({ one, many }) => ({
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
    generationJobs: many(generationJob),
  }),
);
