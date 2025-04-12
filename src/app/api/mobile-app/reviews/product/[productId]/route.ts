import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ReviewController } from "@/server/controllers/review.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/reviews/product")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get reviews by product ID
  .get("/:productId", ReviewController.getReviewsByProductId)
  // Create a new review for a product
  .post("/:productId", ReviewController.createReview);

export const GET = handle(app);
export const POST = handle(app);
