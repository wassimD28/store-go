import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart")
  .use("*", isAuthenticated)
  // Get user's cart with all items
  .get("/", CartController.getCart)
  // Clear all items from cart
  .delete("/", CartController.clearCart)
  // Apply coupon to cart
  .post("/apply-coupon", CartController.applyCoupon);

export const GET = handle(app);
export const DELETE = handle(app);
export const POST = handle(app);
