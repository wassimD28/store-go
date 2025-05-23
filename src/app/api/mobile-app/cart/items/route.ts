import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
  .basePath("/api/mobile-app/cart/items")
  .use("*", isAuthenticated)
  // Add new item to cart
  .post("/", CartController.addToCart);

export const POST = handle(app);
