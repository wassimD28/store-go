

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/products/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  .post("/:productId", CartController.addToCart)
  // Update product quantity in cart
  .put("/:productId", CartController.updateCartItem)
  // Remove product from cart by product ID
  .delete("/:productId", CartController.removeFromCart)

export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);