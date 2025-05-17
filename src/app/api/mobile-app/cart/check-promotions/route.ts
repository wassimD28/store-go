import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CartPromotionController } from "@/server/controllers/cart-promotion.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/cart")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Check promotions for cart items
  .post("/check-promotions", CartPromotionController.checkPromotionsForCart);

export const POST = handle(app);
