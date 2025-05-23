import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart/validate")
  .use("*", isAuthenticated)
  // Validate cart items before checkout
  .post("/", CartController.validateCart);

export const POST = handle(app);
