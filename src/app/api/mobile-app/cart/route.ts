// src/app/api/mobile-app/cart/route.ts

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CartController } from "@/server/controllers/cart.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get cart
  .get("/", CartController.getCart)
  // Add to cart
  .post("/", CartController.addToCart)

  // Clear cart
  .delete("/", CartController.clearCart)
  // Apply coupon
  .post("/coupon", CartController.applyCoupon);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);