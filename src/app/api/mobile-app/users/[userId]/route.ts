import { Hono } from "hono";
import { handle } from "hono/vercel";
import { UserController } from "@/server/controllers/user.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/users")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Update user profile
  .put("/:userId", UserController.updateUser);

export const PUT = handle(app);
