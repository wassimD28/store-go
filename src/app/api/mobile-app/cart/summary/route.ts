import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart/summary")
  .use("*", isAuthenticated)
  // Get cart summary with taxes and shipping
  .get("/", CartController.getCartSummary);

export const GET = handle(app);
