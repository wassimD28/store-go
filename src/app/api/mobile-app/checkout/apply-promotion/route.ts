import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CheckoutPromotionController } from "@/server/controllers/checkout-promotion.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/checkout")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Apply promotion during checkout
  .post("/apply-promotion", CheckoutPromotionController.applyPromotion);

export const POST = handle(app);
