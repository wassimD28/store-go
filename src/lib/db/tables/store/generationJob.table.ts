import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { stores } from "./store.table";
import { storeTemplate } from "./storeTemplate.table";
import { customStoreTemplate } from "./customStoreTemplate.table";
import { relations } from "drizzle-orm";
import { generationJobStatusEnum } from "../tables.enum";

export const generationJob = pgTable("generation_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  storeTemplateId: uuid("store_template_id").references(() => storeTemplate.id),
  customStoreTemplateId: uuid("custom_store_template_id").references(
    () => customStoreTemplate.id,
  ),
  status: generationJobStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  config: jsonb("config"),
  downloadUrl: varchar("download_url", { length: 500 }),
});

export const generationJobRelations = relations(generationJob, ({ one }) => ({
  store: one(stores, {
    fields: [generationJob.storeId],
    references: [stores.id],
  }),
  storeTemplate: one(storeTemplate, {
    fields: [generationJob.storeTemplateId],
    references: [storeTemplate.id],
  }),
  customStoreTemplate: one(customStoreTemplate, {
    fields: [generationJob.customStoreTemplateId],
    references: [customStoreTemplate.id],
  }),
}));
