import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart/items")
  .use("*", isAuthenticated)
  // Get specific cart item
  .get("/:itemId", CartController.getCartItemById)
  // Update cart item quantity/variants
  .put("/:itemId", CartController.updateCartItem)
  // Remove specific cart item
  .delete("/:itemId", CartController.removeCartItem);

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
