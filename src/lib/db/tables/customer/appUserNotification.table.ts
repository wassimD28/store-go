import { boolean, json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { stores } from "../store";
import { appNotificationTypeEnum } from "../tables.enum";
import { AppUser } from "./appUser.table";

// App user notifications
export const AppUserNotification = pgTable("app_user_notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id").references(() => AppUser.id),
  type: appNotificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  data: json("data").default({}),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});
