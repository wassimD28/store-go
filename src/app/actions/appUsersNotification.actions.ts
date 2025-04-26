/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { eq, and, sql } from "drizzle-orm";
// Update imports to use new table structures
import { appNotificationTypeEnum } from "@/lib/db/tables/tables.enum";
import { AppNotification } from "@/lib/db/tables/customer/appNotification.table";
import { AppUserNotificationStatus } from "@/lib/db/tables/customer/appUserNotificationStatus.table";
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
): Promise<ActionResponse<any>> {
  try {
    // Validate inputs
    if (!storeId || !appUserId) {
      throw new Error("Store ID and App User ID are required");
    }

    // Create the notification in the database (not global)
    const [newNotification] = await db
      .insert(AppNotification)
      .values({
        storeId,
        type,
        title,
        content,
        data,
        isGlobal: false, // This is a targeted notification
      })
      .returning();

    // Create the user notification status entry
    const [userStatus] = await db
      .insert(AppUserNotificationStatus)
      .values({
        appUserId,
        notificationId: newNotification.id,
        isRead: false,
        isDeleted: false,
      })
      .returning();

    // Return combined data
    return {
      success: true,
      data: {
        ...newNotification,
        status: userStatus,
      },
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
): Promise<ActionResponse<any>> {
  try {
    // Validate inputs
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    // Create global notification
    const [newNotification] = await db
      .insert(AppNotification)
      .values({
        storeId,
        type,
        title,
        content,
        data,
        isGlobal: true, // This is a global notification
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
 * Marks a specific notification as read for a specific user
 * @param notificationId - ID of the notification to mark as read
 * @param appUserId - ID of the app user
 * @returns Promise with success status or error message
 */
export async function markNotificationAsRead(
  notificationId: string,
  appUserId: string,
): Promise<ActionResponse<any>> {
  try {
    // Find the notification first
    const notification = await db.query.AppNotification.findFirst({
      where: (n) => eq(n.id, notificationId),
    });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    // Check if a status entry already exists for this user and notification
    const existingStatus = await db.query.AppUserNotificationStatus.findFirst({
      where: (status, { and }) =>
        and(
          eq(status.appUserId, appUserId),
          eq(status.notificationId, notificationId),
        ),
    });

    if (existingStatus) {
      // Update existing status
      const [updatedStatus] = await db
        .update(AppUserNotificationStatus)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(eq(AppUserNotificationStatus.id, existingStatus.id))
        .returning();

      return {
        success: true,
        data: {
          ...notification,
          status: updatedStatus,
        },
      };
    } else {
      // Create new status entry
      const now = new Date();
      const [newStatus] = await db
        .insert(AppUserNotificationStatus)
        .values({
          appUserId,
          notificationId,
          isRead: true,
          readAt: now,
        })
        .returning();

      return {
        success: true,
        data: {
          ...notification,
          status: newStatus,
        },
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
    // First get all notifications for this store
    const storeNotifications = await db.query.AppNotification.findMany({
      where: (n) => eq(n.storeId, storeId),
    });

    if (storeNotifications.length === 0) {
      return {
        success: true,
        data: { count: 0 },
      };
    }

    // Get all notification IDs
    const notificationIds = storeNotifications.map((n) => n.id);

    // Get existing status entries for this user - FIX: Use proper SQL condition for array
    const existingStatuses = await db.query.AppUserNotificationStatus.findMany({
      where: (status) =>
        and(
          eq(status.appUserId, appUserId),
          // Use the SQL in operator with proper array handling
          sql`${status.notificationId} IN ${notificationIds}`,
        ),
    });

    // Create a set of notification IDs that already have status entries
    const existingNotificationIds = new Set(
      existingStatuses.map((s) => s.notificationId),
    );

    // For existing entries, update them to read
    if (existingStatuses.length > 0) {
      const now = new Date();
      await db
        .update(AppUserNotificationStatus)
        .set({
          isRead: true,
          readAt: now,
        })
        .where(
          and(
            eq(AppUserNotificationStatus.appUserId, appUserId),
            // FIX: Use proper SQL condition for array
            sql`${AppUserNotificationStatus.notificationId} IN ${notificationIds}`,
          ),
        );
    }

    // For notifications without status entries, create new ones
    const notificationsToCreate = storeNotifications
      .filter((n) => !existingNotificationIds.has(n.id))
      .map((n) => ({
        appUserId,
        notificationId: n.id,
        isRead: true,
        readAt: new Date(),
      }));

    if (notificationsToCreate.length > 0) {
      await db.insert(AppUserNotificationStatus).values(notificationsToCreate);
    }

    return {
      success: true,
      data: { count: storeNotifications.length },
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
 * Gets only unread notifications for a specific user
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getUnreadUserNotifications(
  storeId: string,
  appUserId: string,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<any[]>> {
  try {
    // Get all notifications for this store
    const allNotifications = await db.query.AppNotification.findMany({
      where: (n) => eq(n.storeId, storeId),
    });

    // Get all status entries for this user
    const userStatuses = await db.query.AppUserNotificationStatus.findMany({
      where: (status) => eq(status.appUserId, appUserId),
    });

    // Create a map of notification IDs to statuses
    const statusMap = new Map();
    userStatuses.forEach((status) => {
      statusMap.set(status.notificationId, status);
    });

    // Filter and process notifications
    const processedNotifications = allNotifications
      .filter((notification) => {
        const status = statusMap.get(notification.id);
        
        // Always exclude deleted notifications
        if (status && status.isDeleted) {
          return false;
        }
        
        // For unread notifications: include global ones or ones with status
        return (notification.isGlobal && (!status || !status.isRead)) || 
               (status && !status.isRead);
      })
      .map((notification) => {
        const status = statusMap.get(notification.id);
        return {
          ...notification,
          isRead: status ? status.isRead : false,
          readAt: status ? status.readAt : null,
          isDeleted: status ? status.isDeleted : false,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      success: true,
      data: processedNotifications,
    };
  } catch (error) {
    console.error("Error getting unread user notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get unread user notifications",
    };
  }
}

/**
 * Gets all non-deleted notifications for a specific user, including read ones
 * @param storeId - ID of the store
 * @param appUserId - ID of the app user
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getUserNotificationHistory(
  storeId: string,
  appUserId: string,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<any[]>> {
  try {
    // Get all notifications for this store
    const allNotifications = await db.query.AppNotification.findMany({
      where: (n) => eq(n.storeId, storeId),
    });

    // Get all status entries for this user
    const userStatuses = await db.query.AppUserNotificationStatus.findMany({
      where: (status) => eq(status.appUserId, appUserId),
    });

    // Create a map of notification IDs to statuses
    const statusMap = new Map();
    userStatuses.forEach((status) => {
      statusMap.set(status.notificationId, status);
    });

    // Filter and process notifications
    const processedNotifications = allNotifications
      .filter((notification) => {
        // Include notification if:
        // 1. It's global AND doesn't have a status entry OR
        // 2. It has a status entry that is NOT marked as deleted
        const status = statusMap.get(notification.id);
        return (notification.isGlobal && !status) || (status && !status.isDeleted);
      })
      .map((notification) => {
        const status = statusMap.get(notification.id);
        return {
          ...notification,
          isRead: status ? status.isRead : false,
          readAt: status ? status.readAt : null,
          isDeleted: status ? status.isDeleted : false,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      success: true,
      data: processedNotifications,
    };
  } catch (error) {
    console.error("Error getting user notification history:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get user notification history",
    };
  }
}

/**
 * Deletes a notification for a specific user
 * @param notificationId - ID of the notification to delete
 * @param appUserId - ID of the app user
 * @returns Promise with success status or error message
 */
export async function deleteNotification(
  notificationId: string,
  appUserId: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    // Find the notification
    const notification = await db.query.AppNotification.findFirst({
      where: (n) => eq(n.id, notificationId),
    });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    // Check if a status entry already exists
    const existingStatus = await db.query.AppUserNotificationStatus.findFirst({
      where: (status, { and }) =>
        and(
          eq(status.appUserId, appUserId),
          eq(status.notificationId, notificationId),
        ),
    });

    if (existingStatus) {
      // Update existing status to mark as deleted
      await db
        .update(AppUserNotificationStatus)
        .set({
          isDeleted: true,
        })
        .where(eq(AppUserNotificationStatus.id, existingStatus.id));
    } else {
      // Create new status entry marked as deleted
      await db.insert(AppUserNotificationStatus).values({
        appUserId,
        notificationId,
        isDeleted: true,
      });
    }

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
    // Get all notifications for this store
    const allNotifications = await db.query.AppNotification.findMany({
      where: (n) => eq(n.storeId, storeId),
    });

    // Get all status entries for this user
    const userStatuses = await db.query.AppUserNotificationStatus.findMany({
      where: (status) => eq(status.appUserId, appUserId),
    });

    // Create a map of notification IDs to statuses
    const statusMap = new Map();
    userStatuses.forEach((status) => {
      statusMap.set(status.notificationId, status);
    });

    // Count unread notifications
    const unreadCount = allNotifications.filter((notification) => {
      const status = statusMap.get(notification.id);

      // Include if:
      // 1. It's global AND doesn't have a status entry (never read) OR
      // 2. It has a status entry that is not read AND not deleted
      return (
        (notification.isGlobal && !status) ||
        (status && !status.isRead && !status.isDeleted)
      );
    }).length;

    return {
      success: true,
      data: { count: unreadCount },
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

    // Get all notifications for this store
    const storeNotifications = await db.query.AppNotification.findMany({
      where: (n) => eq(n.storeId, storeId),
    });

    if (storeNotifications.length === 0) {
      return {
        success: true,
        data: { count: 0 },
      };
    }

    // Get existing status entries for this user
    const existingStatuses = await db.query.AppUserNotificationStatus.findMany({
      where: (status) => eq(status.appUserId, appUserId),
    });

    // Create a map of notification IDs to status entries
    const statusMap = new Map();
    existingStatuses.forEach((status) => {
      statusMap.set(status.notificationId, status);
    });

    // For existing status entries, update them to deleted
    const statusesToUpdate = existingStatuses
      .filter((status) => !status.isDeleted)
      .map((status) => status.id);

    if (statusesToUpdate.length > 0) {
      // FIX: Update each status individually or use proper array syntax
      for (const statusId of statusesToUpdate) {
        await db
          .update(AppUserNotificationStatus)
          .set({
            isDeleted: true,
          })
          .where(eq(AppUserNotificationStatus.id, statusId));
      }
    }

    // For notifications without status entries, create new ones marked as deleted
    const notificationsToCreate = storeNotifications
      .filter((n) => !statusMap.has(n.id))
      .map((n) => ({
        appUserId,
        notificationId: n.id,
        isDeleted: true,
      }));

    if (notificationsToCreate.length > 0) {
      await db.insert(AppUserNotificationStatus).values(notificationsToCreate);
    }

    // Count total affected notifications
    const totalAffected =
      statusesToUpdate.length + notificationsToCreate.length;

    return {
      success: true,
      data: { count: totalAffected },
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
