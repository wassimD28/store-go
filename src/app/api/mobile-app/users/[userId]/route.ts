import { Hono } from "hono";
import { handle } from "hono/vercel";
import { UserController } from "@/server/controllers/user.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/users")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Update user profile
  .put("/:userId", UserController.updateUser)
  .get("/:userId", UserController.getUserById);


export const PUT = handle(app);
export const GET = handle(app);
