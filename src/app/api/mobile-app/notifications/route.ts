import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AppUserNotificationController } from "@/server/controllers/appUserNotification.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/notifications")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get all notifications for the authenticated user
  .get("/", AppUserNotificationController.getUserNotifications)
  // Delete all notifications of an app user
  .delete("/", AppUserNotificationController.deleteAllNotifications);

export const GET = handle(app);
export const DELETE = handle(app);
