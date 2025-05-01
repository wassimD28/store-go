import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { AppUser } from "./appUser.table";
import { AppNotification } from "./appNotification.table";

export const AppUserNotificationStatus = pgTable(
  "app_user_notification_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appUserId: uuid("app_user_id")
      .notNull()
      .references(() => AppUser.id),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => AppNotification.id),
    isRead: boolean("is_read").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);
