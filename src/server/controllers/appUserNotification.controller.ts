import { Context } from "hono";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadUserNotifications,
  deleteNotification,
  getUnreadNotificationCount,
  getUserNotificationHistory,
  deleteAllNotifications,
} from "@/app/actions/appUsersNotification.actions";

// Pagination schema for notifications
const paginationSchema = z.object({
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

export class AppUserNotificationController {
  // Get all notifications for a user with pagination
  static async getUserNotifications(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Parse query parameters for pagination
      const url = new URL(c.req.url);
      const limit = url.searchParams.get("limit") || "50";
      const offset = url.searchParams.get("offset") || "0";

      const pagination = paginationSchema.safeParse({
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      if (!pagination.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid pagination parameters",
            errors: pagination.error.format(),
          },
          400,
        );
      }

      const result = await getUnreadUserNotifications(
        storeId,
        appUserId,
        pagination.data.limit,
        pagination.data.offset,
      );

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          500,
        );
      }

      return c.json({
        status: "success",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getUserNotifications:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch user notifications",
        },
        500,
      );
    }
  }

  // Get unread notification count for a user
  static async getUnreadNotificationCount(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      const result = await getUnreadNotificationCount(storeId, appUserId);

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          500,
        );
      }

      return c.json({
        status: "success",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getUnreadNotificationCount:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to get unread notification count",
        },
        500,
      );
    }
  }

  // Mark a specific notification as read
  static async markNotificationAsRead(c: Context) {
    try {
      const notificationId = c.req.param("notificationId");
      const validId = idSchema.safeParse(notificationId);

      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid notification ID",
          },
          400,
        );
      }

      const { id: appUserId } = c.get("user");

      const result = await markNotificationAsRead(notificationId, appUserId);

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          result.error?.includes("not found") ? 404 : 500,
        );
      }

      return c.json({
        status: "success",
        message: "Notification marked as read",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in markNotificationAsRead:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to mark notification as read",
        },
        500,
      );
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      const result = await markAllNotificationsAsRead(storeId, appUserId);

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          500,
        );
      }

      return c.json({
        status: "success",
        message: `${result.data.count} notifications marked as read`,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in markAllNotificationsAsRead:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to mark all notifications as read",
        },
        500,
      );
    }
  }

  // Delete a specific notification
  static async deleteNotification(c: Context) {
    try {
      const notificationId = c.req.param("notificationId");
      const validId = idSchema.safeParse(notificationId);

      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid notification ID",
          },
          400,
        );
      }

      const { id: appUserId } = c.get("user");

      const result = await deleteNotification(notificationId, appUserId);

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          result.error?.includes("not found") ? 404 : 500,
        );
      }

      return c.json({
        status: "success",
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete notification",
        },
        500,
      );
    }
  }

  // Delete all notifications for a user
  static async deleteAllNotifications(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      const result = await deleteAllNotifications(storeId, appUserId);

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          500,
        );
      }

      return c.json({
        status: "success",
        message: `${result.data.count} notifications deleted successfully`,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in deleteAllNotifications:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete all notifications",
        },
        500,
      );
    }
  }

  // Get all user notifications
  static async getAllUserNotifications(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Parse query parameters for pagination
      const url = new URL(c.req.url);
      const limit = url.searchParams.get("limit") || "50";
      const offset = url.searchParams.get("offset") || "0";

      const pagination = paginationSchema.safeParse({
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      if (!pagination.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid pagination parameters",
            errors: pagination.error.format(),
          },
          400,
        );
      }

      const result = await getUserNotificationHistory(
        storeId,
        appUserId,
        pagination.data.limit,
        pagination.data.offset,
      );

      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: result.error,
          },
          500,
        );
      }

      return c.json({
        status: "success",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getAllUserNotifications:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch user notifications",
        },
        500,
      );
    }
  }
}
