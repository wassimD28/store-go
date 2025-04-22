import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AppUserNotificationController } from "@/server/controllers/appUserNotification.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/notifications/all")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get all notifications (read and unread)
  .get("/", AppUserNotificationController.getAllUserNotifications);

export const GET = handle(app);
