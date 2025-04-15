import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/products/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get user's cart
  .get("/", CartController.getCart);

export const GET = handle(app);