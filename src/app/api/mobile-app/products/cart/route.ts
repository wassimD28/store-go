import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { CartController } from "@/server/controllers/cart.controller";

const app = new Hono()
.basePath("/api/mobile-app/products/cart")
.use("*", isAuthenticated)
  .get("/", (c) => {
    console.log("Handling GET /api/mobile-app/products/cart");
    return CartController.getCart(c);
  })
  .delete("/", CartController.clearCart);

export const GET = handle(app);
export const DELETE = handle(app);