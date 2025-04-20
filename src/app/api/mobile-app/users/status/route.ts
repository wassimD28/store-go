import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { UserController } from "@/server/controllers/user.controller";

const app = new Hono()
  .basePath("/api/mobile-app/users/status")
  .use("*", isAuthenticated)
  .post("/", UserController.updateUserStatus);

export const POST = handle(app);
