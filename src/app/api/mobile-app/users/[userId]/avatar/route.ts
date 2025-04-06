import { UploadController } from "@/server/controllers/upload.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono()
  .basePath("/api/mobile-app/users")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Upload avatar
  .post("/:userId/avatar", UploadController.uploadAvatar)
  // Delete avatar
  .delete("/:userId/avatar", UploadController.deleteAvatar);

export const POST = handle(app);
export const DELETE = handle(app);
