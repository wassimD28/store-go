import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AppUserNotificationController } from "@/server/controllers/appUserNotification.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/notifications")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Delete a specific notification
  .delete("/:notificationId", AppUserNotificationController.deleteNotification);

export const DELETE = handle(app);
