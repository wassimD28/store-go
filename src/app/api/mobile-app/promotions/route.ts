import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PromotionController } from "@/server/controllers/promotion.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/promotions")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get all promotions
  .get("/", PromotionController.getAllPromotions);

export const GET = handle(app);
