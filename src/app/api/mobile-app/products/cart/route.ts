import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/products/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Add product to cart by product id
  .post("/:productId", CartController.addToCart)
  // Remove product from cart by product id
  .delete("/:productId", CartController.removeFromCart)
  // Update product quantity in cart
  .put("/:productId", CartController.updateCartItem);

export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);