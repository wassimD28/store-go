import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PromotionController } from "@/server/controllers/promotion.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/promotions/product")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get promotions by product ID
  .get("/:productId", PromotionController.getPromotionsByProductId);

export const GET = handle(app);
