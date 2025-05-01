import { boolean, json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { stores } from "../store";
import { appNotificationTypeEnum } from "../tables.enum";

// IMPORTANT: this table changed from "App user notifications" to "App notifications"
export const AppNotification = pgTable("app_notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  type: appNotificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  data: json("data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Remove appUserId and readAt as they'll be in the in the NEW TABLE "appUserNotificationStatus"
  isGlobal: boolean("is_global").default(true).notNull(),// NEW: this field is used to determine if the notification is global or targeted
});
