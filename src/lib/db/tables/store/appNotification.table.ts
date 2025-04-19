import { boolean, json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { stores } from "./store.table";
import { user } from "../auth";
import { notificationTypeEnum } from "../tables.enum";
import { relations } from "drizzle-orm";

export const AppNotification = pgTable("app_notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  data: json("data").default({}), // For storing additional data (productId, reviewId, etc.)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Define relations for the notifications table
export const AppNotificationRelations = relations(AppNotification, ({ one }) => ({
  store: one(stores, {
    fields: [AppNotification.storeId],
    references: [stores.id],
  }),
}));