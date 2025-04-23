/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { eq, desc, and, count } from "drizzle-orm";
import { StoreNotification, storeNotificationTypeEnum } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { StoreNotificationRepository } from "@/server/repositories/notification.repository";

// Define the type for store notification types using the enum values
type StoreNotificationType =
  (typeof storeNotificationTypeEnum.enumValues)[number];

/**
 * Creates a new notification for a store
 * @param storeId - ID of the store to receive the notification
 * @param type - Type of notification from storeNotificationTypeEnum
 * @param title - Title of the notification
 * @param content - Content/body of the notification
 * @param data - Additional JSON data to include with the notification
 * @returns Promise with success status and created notification or error message
 */
export async function createStoreNotification(
  storeId: string,
  type: StoreNotificationType,
  title: string,
  content: string,
  data: Record<string, any> = {},
): Promise<ActionResponse<typeof StoreNotification.$inferSelect>> {
  try {
    // Validate inputs
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    // Use the repository to create the notification
    const newNotification = await StoreNotificationRepository.create({
      storeId,
      type,
      title,
      content,
      data,
    });

    return {
      success: true,
      data: newNotification,
    };
  } catch (error) {
    console.error("Error creating store notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create store notification",
    };
  }
}

/**
 * Marks a specific notification as read
 * @param notificationId - ID of the notification to mark as read
 * @returns Promise with success status and updated notification or error message
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<ActionResponse<typeof StoreNotification.$inferSelect>> {
  try {
    // Find the notification first to verify it exists
    const notification = await db.query.StoreNotification.findFirst({
      where: (notification) => eq(notification.id, notificationId),
    });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    // Update the notification to mark it as read
    const now = new Date();
    const [updatedNotification] = await db
      .update(StoreNotification)
      .set({
        isRead: true,
        readAt: now,
      })
      .where(eq(StoreNotification.id, notificationId))
      .returning();

    return {
      success: true,
      data: updatedNotification,
    };
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
 * Marks all notifications for a store as read
 * @param storeId - ID of the store
 * @returns Promise with success status and count of updated notifications or error message
 */
export async function markAllNotificationsAsRead(
  storeId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    // Find all unread notifications for this store
    const result = await db
      .update(StoreNotification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(StoreNotification.storeId, storeId),
          eq(StoreNotification.isRead, false),
        ),
      )
      .returning();

    return {
      success: true,
      data: { count: result.length },
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
 * Gets all notifications for a specific store
 * @param storeId - ID of the store
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getAllNotifications(
  storeId: string,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<Array<typeof StoreNotification.$inferSelect>>> {
  try {
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const notifications = await db
      .select()
      .from(StoreNotification)
      .where(eq(StoreNotification.storeId, storeId))
      .orderBy(desc(StoreNotification.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error getting store notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get store notifications",
    };
  }
}

/**
 * Deletes a notification
 * @param notificationId - ID of the notification to delete
 * @param storeId - ID of the store to verify ownership
 * @returns Promise with success status or error message
 */
export async function deleteNotification(
  notificationId: string,
  storeId: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    // Find the notification first to verify it belongs to this store
    const notification = await db.query.StoreNotification.findFirst({
      where: (notification, { and, eq }) => {
        return and(
          eq(notification.id, notificationId),
          eq(notification.storeId, storeId),
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
      .delete(StoreNotification)
      .where(eq(StoreNotification.id, notificationId));

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
 * Gets the count of unread notifications for a store
 * @param storeId - ID of the store
 * @returns Promise with success status and unread count or error message
 */
export async function getUnreadNotificationCount(
  storeId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db
      .select({ count: count() })
      .from(StoreNotification)
      .where(
        and(
          eq(StoreNotification.storeId, storeId),
          eq(StoreNotification.isRead, false),
        ),
      );

    return {
      success: true,
      data: { count: Number(result[0]?.count || 0) },
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
 * Gets notifications filtered by type for a specific store
 * @param storeId - ID of the store
 * @param type - Type of notification to filter by
 * @param limit - Maximum number of notifications to return (default 50)
 * @param offset - Number of notifications to skip (for pagination)
 * @returns Promise with success status and notifications array or error message
 */
export async function getNotificationsByType(
  storeId: string,
  type: StoreNotificationType,
  limit = 50,
  offset = 0,
): Promise<ActionResponse<Array<typeof StoreNotification.$inferSelect>>> {
  try {
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const notifications = await db
      .select()
      .from(StoreNotification)
      .where(
        and(
          eq(StoreNotification.storeId, storeId),
          eq(StoreNotification.type, type),
        ),
      )
      .orderBy(desc(StoreNotification.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error getting notifications by type:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get notifications by type",
    };
  }
}
