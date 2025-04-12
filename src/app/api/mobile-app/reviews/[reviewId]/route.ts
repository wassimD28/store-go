import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ReviewController } from "@/server/controllers/review.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/reviews")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get review by ID
  .get("/:reviewId", ReviewController.getReviewById)
  // Update a review
  .put("/:reviewId", ReviewController.updateReview)
  // Delete a review
  .delete("/:reviewId", ReviewController.deleteReview);

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
