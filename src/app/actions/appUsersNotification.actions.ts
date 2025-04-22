/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import {
  eq,
  desc,
  and,
  isNull,
  sql,
  count,
} from "drizzle-orm";
import { appNotificationTypeEnum, AppUserNotification } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";

export type AppNotificationType = (typeof appNotificationTypeEnum.enumValues)[number];

/**
 * Creates a notification for a specific app user
 * @param storeId - ID of the store sending the notification
 * @param appUserId - ID of the app user to receive the notification
 * @param type - Type of notification based on appNotificationTypeEnum
 * @param title - Title of the notification
 * @param content - Content/body of the notification
 * @param data - Additional JSON data to include with the notification
 * @returns Promise with success status and created notification or error message
 */
export async function createSingleUserNotification(
  storeId: string,
  appUserId: string,
  type: AppNotificationType,
  title: string,
  content: string,
  data: Record<string, any> = {},
): Promise<ActionResponse<typeof AppUserNotification.$inferSelect>> {
  try {
    // Validate inputs
    if (!storeId || !appUserId) {
      throw new Error("Store ID and App User ID are required");
    }

    // Create the notification in the database
    const [newNotification] = await db
      .insert(AppUserNotification)
      .values({
        storeId,
        appUserId,
        type,
        title,
        content,
        data,
        isRead: false,
      })
      .returning();

    return {
      success: true,
      data: newNotification,
    };
  } catch (error) {
    console.error("Error creating user notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create user notification",
    };
  }
}

/**
 * Creates a broadcast notification for all app users of a store
 * @param storeId - ID of the store sending the notification
 * @param type - Type of notification based on appNotificationTypeEnum
 * @param title - Title of the notification
 * @param content - Content/body of the notification
 * @param data - Additional JSON data to include with the notification
 * @returns Promise with success status and created notification or error message
 */
export async function createBroadcastNotification(
  storeId: string,
  type: AppNotificationType,
  title: string,
  content: string,
  data: Record<string, any> = {},
): Promise<ActionResponse<typeof AppUserNotification.$inferSelect>> {
  try {
    // Validate inputs
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    // Create broadcast notification (null appUserId means for all users)
    const [newNotification] = await db
      .insert(AppUserNotification)
      .values({
        storeId,
        appUserId: null,
        type,
        title,
        content,
        data,
        isRead: false,
      })
      .returning();

    return {
      success: true,
      data: newNotification,
    };
  } catch (error) {
    console.error("Error creating broadcast notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create broadcast notification",
    };
  }
}

/**
 * Marks a specific notification as read
 * @param notificationId - ID of the notification to mark as read
 * @param appUserId - ID of the app user to verify ownership
 * @returns Promise with success status or error message
 */
export async function markNotificationAsRead(
  notificationId: string,
  appUserId: string,
): Promise<ActionResponse<typeof AppUserNotification.$inferSelect>> {
  try {
    // Find the notification first to verify ownership
    const notification = await db.query.AppUserNotification.findFirst({
      where: (notification, { and, eq, or, isNull }) => {
        return and(
          eq(notification.id, notificationId),
          // Check if the notification is for this specific user or is a broadcast
          or(
            eq(notification.appUserId, appUserId),
            isNull(notification.appUserId),
          ),
        );
      },
    });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found or you don't have access to it",
      };
    }

    // For broadcast notifications (null appUserId), we need to create a user-specific "read" entry
    // instead of modifying the original broadcast notification
    if (notification.appUserId === null) {
      // Create a user-specific copy of the broadcast notification marked as read
      // FIX 1: Handle data merging properly to avoid spread type error
      const notificationData = (notification.data as Record<string, any>) || {};
      const mergedData = {
        ...notificationData,
        originalBroadcastId: notification.id,
      };

      const [userReadRecord] = await db
        .insert(AppUserNotification)
        .values({
          storeId: notification.storeId,
          appUserId, // Associate with specific user
          type: notification.type,
          title: notification.title,
          content: notification.content,
          isRead: true,
          readAt: new Date(),
          // Use properly merged data
          data: mergedData,
        })
        .returning();

      return {
        success: true,
        data: userReadRecord,
      };
    } else {
      // For user-specific notifications, update the existing record
      const now = new Date();
      const [updatedNotification] = await db
        .update(AppUserNotification)
        .set({
          isRead: true,
          readAt: now,
        })
        .where(eq(AppUserNotification.id, notificationId))
        .returning();

      return {
        success: true,
        data: updatedNotification,
      };
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    };
  }
}

/**
 * Marks all notifications for a user as read
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @returns Promise with success status or error message
 */
export async function markAllNotificationsAsRead(
  storeId: string,
  appUserId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    // Find all unread notifications for this user
    const unreadNotifications = await db.query.AppUserNotification.findMany({
      where: (notification, { and, eq, or, isNull }) => {
        return and(
          eq(notification.storeId, storeId),
          or(
            eq(notification.appUserId, appUserId),
            isNull(notification.appUserId),
          ),
          eq(notification.isRead, false),
        );
      },
    });

    const broadcastNotifications = unreadNotifications.filter(
      (notification) => notification.appUserId === null,
    );

    const userSpecificNotifications = unreadNotifications.filter(
      (notification) => notification.appUserId === appUserId,
    );

    // For broadcast notifications, create user-specific "read" records
    if (broadcastNotifications.length > 0) {
      const now = new Date();

      // Prepare the values for bulk insert with proper data handling
      const valuesToInsert = broadcastNotifications.map((notification) => {
        // FIX 2: Handle data merging properly to avoid spread type error
        const notificationData =
          (notification.data as Record<string, any>) || {};
        const mergedData = {
          ...notificationData,
          originalBroadcastId: notification.id,
        };

        return {
          storeId: notification.storeId,
          appUserId, // Associate with specific user
          type: notification.type,
          title: notification.title,
          content: notification.content,
          data: mergedData,
          isRead: true,
          readAt: now,
        };
      });

      await db.insert(AppUserNotification).values(valuesToInsert);
    }

    // For user-specific notifications, update them to read
    if (userSpecificNotifications.length > 0) {
      const now = new Date();
      await db
        .update(AppUserNotification)
        .set({
          isRead: true,
          readAt: now,
        })
        .where(
          and(
            eq(AppUserNotification.storeId, storeId),
            eq(AppUserNotification.appUserId, appUserId),
            eq(AppUserNotification.isRead, false),
          ),
        );
    }

    return {
      success: true,
      data: { count: unreadNotifications.length },
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
    };
  }
}

/**
 * Gets all notifications for a specific user
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getUserNotifications(
  storeId: string,
  appUserId: string,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<Array<typeof AppUserNotification.$inferSelect>>> {
  try {
    // Get broadcast notifications
    const broadcastQuery = db
      .select()
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          isNull(AppUserNotification.appUserId),
        ),
      );

    const broadcastNotifications = await broadcastQuery;

    // Get user-specific read records to filter out broadcasts that have been read
    const readBroadcastIds = await db
      .select({
        originalId: sql<string>`data->>'originalBroadcastId'`,
      })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.appUserId, appUserId),
          eq(AppUserNotification.isRead, true),
        ),
      );

    // Create a Set of broadcast IDs that have been read
    const readBroadcastIdSet = new Set(
      readBroadcastIds.map((item) => item.originalId).filter(Boolean), // Remove null/undefined values
    );

    // Filter out broadcast notifications that the user has already read
    const unreadBroadcasts = broadcastNotifications.filter(
      (notification) => !readBroadcastIdSet.has(notification.id),
    );

    // Get user-specific notifications
    const userNotifications = await db
      .select()
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
        ),
      )
      .orderBy(desc(AppUserNotification.createdAt));

    // Combine and sort notifications by date
    const allNotifications = [...unreadBroadcasts, ...userNotifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      success: true,
      data: allNotifications,
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get user notifications",
    };
  }
}

/**
 * Deletes a notification
 * @param notificationId - ID of the notification to delete
 * @param appUserId - ID of the app user to verify ownership
 * @returns Promise with success status or error message
 */
export async function deleteNotification(
  notificationId: string,
  appUserId: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    // Find the notification first to verify it belongs to this user
    const notification = await db.query.AppUserNotification.findFirst({
      where: (notification, { and, eq }) => {
        return and(
          eq(notification.id, notificationId),
          eq(notification.appUserId, appUserId),
        );
      },
    });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found or you don't have access to delete it",
      };
    }

    // Delete the notification
    await db
      .delete(AppUserNotification)
      .where(eq(AppUserNotification.id, notificationId));

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete notification",
    };
  }
}

/**
 * Gets the count of unread notifications for a user
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @returns Promise with success status and unread count or error message
 */
export async function getUnreadNotificationCount(
  storeId: string,
  appUserId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    // Get all broadcast notifications
    const broadcasts = await db
      .select({ id: AppUserNotification.id })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          isNull(AppUserNotification.appUserId),
        ),
      );

    // Get IDs of broadcasts the user has already read
    const readBroadcastIds = await db
      .select({
        originalId: sql<string>`data->>'originalBroadcastId'`,
      })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.appUserId, appUserId),
          eq(AppUserNotification.isRead, true),
        ),
      );

    // Create a Set of broadcast IDs that the user has read
    const readBroadcastIdSet = new Set(
      readBroadcastIds.map((item) => item.originalId).filter(Boolean), // Remove null/undefined values
    );

    // Count unread broadcasts
    const unreadBroadcastCount = broadcasts.filter(
      (broadcast) => !readBroadcastIdSet.has(broadcast.id),
    ).length;

    // Count user-specific unread notifications
    const userUnreadResult = await db
      .select({ count: count() })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
          eq(AppUserNotification.isRead, false),
        ),
      );

    const userUnreadCount = userUnreadResult[0]?.count || 0;

    // Sum both counts
    return {
      success: true,
      data: { count: unreadBroadcastCount + Number(userUnreadCount) },
    };
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get unread notification count",
    };
  }
}
