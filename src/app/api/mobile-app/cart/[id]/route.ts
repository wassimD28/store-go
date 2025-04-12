import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Get category by ID
  // Update cart item
  .put("/:itemId", CartController.updateCartItem)
  // Remove from cart
  .delete("/:itemId", CartController.removeFromCart)
export const GET = handle(app);
