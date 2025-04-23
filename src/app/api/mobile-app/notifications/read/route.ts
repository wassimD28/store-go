import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AppUserNotificationController } from "@/server/controllers/appUserNotification.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/notifications/read")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get count of unread notifications
  .get("/", AppUserNotificationController.getUnreadNotificationCount)
  // Mark all notifications as read
  .put("/", AppUserNotificationController.markAllNotificationsAsRead);

export const GET = handle(app);
export const PUT = handle(app);
