/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../../lib/db/db";
import { eq, and, count } from "drizzle-orm";
import { AppNotification, notificationTypeEnum } from "@/lib/db";

// Define types for notification data using the actual enum type
type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

interface NotificationData {
  storeId: string;
  userId: string;
  type: NotificationType; // Use the enum type instead of string
  title: string;
  content: string;
  data?: Record<string, any>;
}

export class NotificationRepository {
  static async findByUserId(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<(typeof AppNotification.$inferSelect)[]> {
    try {
      return await db.query.AppNotification.findMany({
        where: eq(AppNotification.userId, userId),
        orderBy: (notification) => notification.createdAt,
        limit,
        offset,
      });
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error);
      throw new Error(`Failed to fetch notifications for user ${userId}`);
    }
  }

  static async findByStoreId(
    storeId: string,
    limit = 50,
    offset = 0,
  ): Promise<(typeof AppNotification.$inferSelect)[]> {
    try {
      return await db.query.AppNotification.findMany({
        where: eq(AppNotification.storeId, storeId),
        orderBy: (notification) => notification.createdAt,
        limit,
        offset,
      });
    } catch (error) {
      console.error(
        `Error fetching notifications for store ${storeId}:`,
        error,
      );
      throw new Error(`Failed to fetch notifications for store ${storeId}`);
    }
  }

  static async findById(
    notificationId: string,
  ): Promise<typeof AppNotification.$inferSelect | null> {
    try {
      const result = await db.query.AppNotification.findFirst({
        where: eq(AppNotification.id, notificationId),
      });
      return result ?? null;
    } catch (error) {
      console.error(`Error fetching notification ${notificationId}:`, error);
      throw new Error(`Failed to fetch notification ${notificationId}`);
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count(AppNotification.id) })
        .from(AppNotification)
        .where(
          and(
            eq(AppNotification.userId, userId),
            eq(AppNotification.isRead, false),
          ),
        );

      return parseInt(result[0].count.toString(), 10);
    } catch (error) {
      console.error(
        `Error getting unread notification count for ${userId}:`,
        error,
      );
      throw new Error(`Failed to get unread notification count for ${userId}`);
    }
  }

  static async create(
    notificationData: NotificationData,
  ): Promise<typeof AppNotification.$inferSelect> {
    try {
      // Ensure the type is valid
      if (
        !notificationTypeEnum.enumValues.includes(notificationData.type as any)
      ) {
        throw new Error(`Invalid notification type: ${notificationData.type}`);
      }

      const [newNotification] = await db
        .insert(AppNotification)
        .values({
          storeId: notificationData.storeId,
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          content: notificationData.content,
          data: notificationData.data || {},
        })
        .returning();
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  static async markAsRead(
    notificationId: string,
  ): Promise<typeof AppNotification.$inferSelect> {
    try {
      const now = new Date();
      const [updatedNotification] = await db
        .update(AppNotification)
        .set({
          isRead: true,
          readAt: now,
        })
        .where(eq(AppNotification.id, notificationId))
        .returning();
      return updatedNotification;
    } catch (error) {
      console.error(
        `Error marking notification ${notificationId} as read:`,
        error,
      );
      throw new Error(`Failed to mark notification ${notificationId} as read`);
    }
  }

  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const now = new Date();
      const result = await db
        .update(AppNotification)
        .set({
          isRead: true,
          readAt: now,
        })
        .where(
          and(
            eq(AppNotification.userId, userId),
            eq(AppNotification.isRead, false),
          ),
        );

      return result.rowCount || 0;
    } catch (error) {
      console.error(
        `Error marking all notifications as read for user ${userId}:`,
        error,
      );
      throw new Error(
        `Failed to mark all notifications as read for user ${userId}`,
      );
    }
  }

  static async delete(notificationId: string): Promise<boolean> {
    try {
      await db
        .delete(AppNotification)
        .where(eq(AppNotification.id, notificationId));
      return true;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw new Error(`Failed to delete notification ${notificationId}`);
    }
  }

  static async deleteAllForUser(userId: string): Promise<number> {
    try {
      const result = await db
        .delete(AppNotification)
        .where(eq(AppNotification.userId, userId));
      return result.rowCount || 0;
    } catch (error) {
      console.error(
        `Error deleting all notifications for user ${userId}:`,
        error,
      );
      throw new Error(`Failed to delete all notifications for user ${userId}`);
    }
  }
}
