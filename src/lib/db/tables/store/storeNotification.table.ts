import {
  boolean,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { stores } from "./store.table";
import { relations } from "drizzle-orm";
import { storeNotificationTypeEnum } from "../tables.enum";

// Store owner notifications
export const StoreNotification = pgTable("store_notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  type: storeNotificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  data: json("data").default({}),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});
// Define relations for the notifications table
export const StoreNotificationRelations = relations(
  StoreNotification,
  ({ one }) => ({
    store: one(stores, {
      fields: [StoreNotification.storeId],
      references: [stores.id],
    }),
  }),
);
