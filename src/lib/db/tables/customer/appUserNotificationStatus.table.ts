import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { AppUser } from "./appUser.table";
import { AppNotification } from "./appNotification.table";
import { relations } from "drizzle-orm";

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

// Define relations for AppUserNotificationStatus
export const AppUserNotificationStatusRelations = relations(
  AppUserNotificationStatus,
  ({ one }) => ({
    user: one(AppUser, {
      fields: [AppUserNotificationStatus.appUserId],
      references: [AppUser.id],
    }),
    notification: one(AppNotification, {
      fields: [AppUserNotificationStatus.notificationId],
      references: [AppNotification.id],
    }),
  }),
);
