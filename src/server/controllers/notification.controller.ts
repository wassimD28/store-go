
import { Context } from "hono";
import { NotificationRepository } from "../repositories/notification.repository";
import { idSchema } from "../schemas/common.schema";

export class NotificationController {
  static async getNotifications(c: Context) {
    try {
      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Parse query parameters
      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = parseInt(c.req.query("limit") || "20", 10);

      // Validate and cap the limit to prevent excessive queries
      const validLimit = Math.min(limit, 100);
      const offset = (page - 1) * validLimit;

      // Get notifications
      const notifications = await NotificationRepository.findByUserId(
        userId,
        validLimit,
        offset,
      );

      // Get unread count
      const unreadCount = await NotificationRepository.getUnreadCount(userId);

      return c.json({
        status: "success",
        data: {
          notifications,
          unreadCount,
          page,
          limit: validLimit,
        },
      });
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch notifications",
        },
        500,
      );
    }
  }

  static async getNotification(c: Context) {
    try {
      const notificationId = c.req.param("notificationId");

      // Validate notification ID
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

      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Get notification
      const notification =
        await NotificationRepository.findById(notificationId);

      if (!notification) {
        return c.json(
          {
            status: "error",
            message: "Notification not found",
          },
          404,
        );
      }

      // Check if notification belongs to user
      if (notification.userId !== userId) {
        return c.json(
          {
            status: "error",
            message: "You are not authorized to access this notification",
          },
          403,
        );
      }

      return c.json({
        status: "success",
        data: notification,
      });
    } catch (error) {
      console.error("Error in getNotification:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch notification",
        },
        500,
      );
    }
  }

  static async markAsRead(c: Context) {
    try {
      const notificationId = c.req.param("notificationId");

      // Validate notification ID
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

      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Get notification
      const notification =
        await NotificationRepository.findById(notificationId);

      if (!notification) {
        return c.json(
          {
            status: "error",
            message: "Notification not found",
          },
          404,
        );
      }

      // Check if notification belongs to user
      if (notification.userId !== userId) {
        return c.json(
          {
            status: "error",
            message: "You are not authorized to update this notification",
          },
          403,
        );
      }

      // Mark notification as read
      const updatedNotification =
        await NotificationRepository.markAsRead(notificationId);

      return c.json({
        status: "success",
        message: "Notification marked as read",
        data: updatedNotification,
      });
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to mark notification as read",
        },
        500,
      );
    }
  }

  static async markAllAsRead(c: Context) {
    try {
      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Mark all notifications as read
      const affectedCount = await NotificationRepository.markAllAsRead(userId);

      return c.json({
        status: "success",
        message: `${affectedCount} notifications marked as read`,
      });
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to mark all notifications as read",
        },
        500,
      );
    }
  }

  static async deleteNotification(c: Context) {
    try {
      const notificationId = c.req.param("notificationId");

      // Validate notification ID
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

      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Get notification
      const notification =
        await NotificationRepository.findById(notificationId);

      if (!notification) {
        return c.json(
          {
            status: "error",
            message: "Notification not found",
          },
          404,
        );
      }

      // Check if notification belongs to user
      if (notification.userId !== userId) {
        return c.json(
          {
            status: "error",
            message: "You are not authorized to delete this notification",
          },
          403,
        );
      }

      // Delete notification
      await NotificationRepository.delete(notificationId);

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

  static async deleteAllNotifications(c: Context) {
    try {
      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Delete all notifications
      const affectedCount =
        await NotificationRepository.deleteAllForUser(userId);

      return c.json({
        status: "success",
        message: `${affectedCount} notifications deleted successfully`,
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
}
