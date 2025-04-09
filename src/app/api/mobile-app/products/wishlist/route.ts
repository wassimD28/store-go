import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { WishlistController } from "@/server/controllers/wishlist.controller";

const app = new Hono()
  .basePath("/api/mobile-app/products/wishlist")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get user's wishlist
  .get("/", WishlistController.getWishlist);

export const GET = handle(app);
