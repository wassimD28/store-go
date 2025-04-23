import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AppUserNotificationController } from "@/server/controllers/appUserNotification.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/notifications/read")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Mark a specific notification as read
  .put(
    "/:notificationId",
    AppUserNotificationController.markNotificationAsRead,
  );

export const PUT = handle(app);
