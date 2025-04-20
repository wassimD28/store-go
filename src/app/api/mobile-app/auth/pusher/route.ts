import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import PusherController from "@/server/controllers/pusher.controller";

const app = new Hono()
  .basePath("/api/mobile-app/auth/pusher")
  .use("*", isAuthenticated)
  .post("/", PusherController.authenticatePresenceChannel);

export const POST = handle(app);
