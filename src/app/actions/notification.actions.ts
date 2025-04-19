/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { AppNotification } from "@/lib/db";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq, and } from "drizzle-orm";

/**
 * Get all notifications for a specific store
 */
export async function getAllNotifications(
  storeId: string,
): Promise<ActionResponse<(typeof AppNotification.$inferSelect)[]>> {
  try {
    const notifications = await db
      .select()
      .from(AppNotification)
      .where(eq(AppNotification.storeId, storeId))
      .orderBy(AppNotification.createdAt);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications",
    };
  }
}

/**
 * Get all unread notifications for a specific store owner
 */
export async function getUnreadNotifications(
  storeId: string,
  userId: string,
): Promise<ActionResponse<(typeof AppNotification.$inferSelect)[]>> {
  try {
    const notifications = await db
      .select()
      .from(AppNotification)
      .where(
        and(
          eq(AppNotification.storeId, storeId),
          eq(AppNotification.userId, userId),
          eq(AppNotification.isRead, false),
        ),
      )
      .orderBy(AppNotification.createdAt);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch unread notifications",
    };
  }
}

/**
 * Get all read notifications for a specific store owner
 */
export async function getReadNotifications(
  storeId: string,
  userId: string,
): Promise<ActionResponse<(typeof AppNotification.$inferSelect)[]>> {
  try {
    const notifications = await db
      .select()
      .from(AppNotification)
      .where(
        and(
          eq(AppNotification.storeId, storeId),
          eq(AppNotification.userId, userId),
          eq(AppNotification.isRead, true),
        ),
      )
      .orderBy(AppNotification.createdAt);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error fetching read notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch read notifications",
    };
  }
}

/**
 * Get a specific notification by ID
 */
export async function getNotificationById(
  notificationId: string,
): Promise<ActionResponse<typeof AppNotification.$inferSelect>> {
  try {
    const [notification] = await db
      .select()
      .from(AppNotification)
      .where(eq(AppNotification.id, notificationId));

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error("Error fetching notification:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch notification",
    };
  }
}

/**
 * Create a new notification for a store owner
 */
export async function createNotification(
  storeId: string,
  userId: string,
  type: string,
  title: string,
  content: string,
  data: Record<string, any> = {},
): Promise<ActionResponse<typeof AppNotification.$inferSelect>> {
  try {
    // Validate notification type against the enum
    const validTypes = [
      "new_review",
      "new_order",
      "product_out_of_stock",
      "order_status_change",
      "payment_received",
      "promotion_created",
    ];

    if (!validTypes.includes(type)) {
      return {
        success: false,
        error: `Invalid notification type. Must be one of: ${validTypes.join(", ")}`,
      };
    }

    const [newNotification] = await db
      .insert(AppNotification)
      .values({
        storeId,
        userId,
        type: type as any, // Type assertion to handle enum
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
    console.error("Error creating notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create notification",
    };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<ActionResponse<typeof AppNotification.$inferSelect>> {
  try {
    const [updatedNotification] = await db
      .update(AppNotification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(AppNotification.id, notificationId))
      .returning();

    if (!updatedNotification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

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
 * Mark all notifications for a store owner as read
 */
export async function markAllNotificationsAsRead(
  storeId: string,
): Promise<ActionResponse<{ count: number }>> {
  try {
    const result = await db
      .update(AppNotification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(AppNotification.storeId, storeId),
          eq(AppNotification.isRead, false),
        ),
      );

    return {
      success: true,
      data: { count: result.rowCount || 0 },
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
