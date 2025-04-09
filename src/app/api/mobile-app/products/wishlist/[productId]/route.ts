import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { WishlistController } from "@/server/controllers/wishlist.controller";

const app = new Hono()
  .basePath("/api/mobile-app/products/wishlist")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Add product to wishlist by product id
  .post("/:productId", WishlistController.addToWishlist)
  // Remove product from wishlist by product id
  .delete("/:productId", WishlistController.removeFromWishlist);

export const POST = handle(app);
export const DELETE = handle(app);
