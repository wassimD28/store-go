import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get cart item by ID (this should be renamed to itemId for clarity)
  .get("/:cartId", CartController.getCartItemById);

export const GET = handle(app);
