/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { eq, desc, and, isNull, sql, count } from "drizzle-orm";
import { appNotificationTypeEnum, AppUserNotification } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";

export type AppNotificationType =
  (typeof appNotificationTypeEnum.enumValues)[number];

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
      // Check if a read receipt already exists for this broadcast notification
      const existingReadReceipt = await db
        .select()
        .from(AppUserNotification)
        .where(
          and(
            eq(AppUserNotification.appUserId, appUserId),
            sql`data->>'originalBroadcastId' = ${notification.id}`,
          ),
        )
        .limit(1);

      // If a read receipt already exists, return it instead of creating a new one
      if (existingReadReceipt.length > 0) {
        return {
          success: true,
          data: existingReadReceipt[0],
        };
      }
      // Create a user-specific copy of the broadcast notification marked as read
      // Handle data merging properly to avoid spread type error
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

    // Create a Set of broadcast IDs that the user has already read
    const readBroadcastIdSet = new Set(
      readBroadcastIds.map((item) => item.originalId).filter(Boolean),
    );

    // Find all broadcast notifications
    const broadcastNotifications = await db.query.AppUserNotification.findMany({
      where: (notification, { and, eq, isNull }) => {
        return and(
          eq(notification.storeId, storeId),
          isNull(notification.appUserId),
        );
      },
    });

    // Filter to only broadcasts that haven't been read
    const unreadBroadcasts = broadcastNotifications.filter(
      (notification) => !readBroadcastIdSet.has(notification.id),
    );

    // Find user-specific unread notifications
    const userSpecificNotifications =
      await db.query.AppUserNotification.findMany({
        where: (notification, { and, eq }) => {
          return and(
            eq(notification.storeId, storeId),
            eq(notification.appUserId, appUserId),
            eq(notification.isRead, false),
            // Exclude "read receipt" copies
            sql`(data->>'originalBroadcastId') IS NULL`,
          );
        },
      });

    // Count total notifications that will actually be updated
    const totalToUpdate =
      unreadBroadcasts.length + userSpecificNotifications.length;

    // If nothing to update, return early
    if (totalToUpdate === 0) {
      return {
        success: true,
        data: { count: 0 },
      };
    }

    // Create read receipts for truly unread broadcasts
    if (unreadBroadcasts.length > 0) {
      const now = new Date();

      const valuesToInsert = unreadBroadcasts.map((notification) => {
        const notificationData =
          (notification.data as Record<string, any>) || {};
        const mergedData = {
          ...notificationData,
          originalBroadcastId: notification.id,
        };

        return {
          storeId: notification.storeId,
          appUserId,
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

    // Update user-specific notifications to read
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
            sql`(data->>'originalBroadcastId') IS NULL`,
          ),
        );
    }

    return {
      success: true,
      data: { count: totalToUpdate },
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

    // Get user-specific notifications, but exclude "read receipt" copies of broadcast notifications
    // This is the key fix - we're adding a condition to filter out records that have an originalBroadcastId
    const userNotifications = await db
      .select()
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
          // This is the new condition to exclude "read receipt" copies of broadcasts
          sql`(data->>'originalBroadcastId') IS NULL`,
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
      readBroadcastIds.map((item) => item.originalId).filter(Boolean),
    );

    // Count unread broadcasts
    const unreadBroadcastCount = broadcasts.filter(
      (broadcast) => !readBroadcastIdSet.has(broadcast.id),
    ).length;

    // Count user-specific unread notifications, excluding "read receipt" copies
    const userUnreadResult = await db
      .select({ count: count() })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
          eq(AppUserNotification.isRead, false),
          // condition to exclude "read receipt" copies
          sql`(data->>'originalBroadcastId') IS NULL`,
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

/**
 * Gets all notifications for a specific user, including read ones
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @param includeRead - Whether to include read notifications
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getAllUserNotifications(
  storeId: string,
  appUserId: string,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<Array<typeof AppUserNotification.$inferSelect>>> {
  try {
    // Get all broadcast notifications
    const broadcastNotifications = await db
      .select()
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          isNull(AppUserNotification.appUserId),
        ),
      );

    // Get user-specific read records to identify which broadcasts have been read
    const readBroadcastEntries = await db
      .select({
        originalId: sql<string>`data->>'originalBroadcastId'`,
        readAt: AppUserNotification.readAt,
        id: AppUserNotification.id,
      })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.appUserId, appUserId),
          eq(AppUserNotification.isRead, true),
          sql`data->>'originalBroadcastId' IS NOT NULL`,
        ),
      );

    // Create a map of broadcast IDs to their read receipts
    const readBroadcastMap = new Map();
    readBroadcastEntries.forEach(entry => {
      if (entry.originalId) {
        readBroadcastMap.set(entry.originalId, {
          readAt: entry.readAt,
          readReceiptId: entry.id
        });
      }
    });

    // Process broadcast notifications, marking them as read if needed
    const processedBroadcasts = broadcastNotifications.map(notification => {
      const readInfo = readBroadcastMap.get(notification.id);
      return {
        ...notification,
        isRead: !!readInfo,
        readAt: readInfo?.readAt || null,
        readReceiptId: readInfo?.readReceiptId || null,
      };
    });

    // Get all user-specific notifications, excluding read receipt copies
    const userNotifications = await db
      .select()
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
          // This excludes "read receipt" copies of broadcasts
          sql`(data->>'originalBroadcastId') IS NULL`,
        ),
      );

    // Combine and sort all notifications by date
    const allNotifications = [...processedBroadcasts, ...userNotifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      success: true,
      data: allNotifications,
    };
  } catch (error) {
    console.error("Error getting all user notifications:", error);
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
 * Deletes all notifications for a specific app user
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @returns Promise with success status and count of deleted notifications or error message
 */
export async function deleteAllNotifications(
  storeId: string,
  appUserId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    // Validate inputs
    if (!storeId || !appUserId) {
      throw new Error("Store ID and App User ID are required");
    }

    // We need to handle both user-specific notifications and read receipts for broadcast notifications
    
    // 1. Count how many notifications we're going to delete (for reporting back)
    const userSpecificCount = await db
      .select({ count: count() })
      .from(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
        ),
      );

    const totalCount = userSpecificCount[0]?.count || 0;

    // 2. Delete all user-specific notifications (including read receipts for broadcasts)
    await db
      .delete(AppUserNotification)
      .where(
        and(
          eq(AppUserNotification.storeId, storeId),
          eq(AppUserNotification.appUserId, appUserId),
        ),
      );

    return {
      success: true,
      data: { count: Number(totalCount) },
    };
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete all notifications",
    };
  }
}
