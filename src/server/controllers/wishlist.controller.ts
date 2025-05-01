import { Context } from "hono";
import { WishlistRepository } from "@/server/repositories/wishlist.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";

export class WishlistController {
  static async addToWishlist(c: Context) {
    try {
      const productId = c.req.param("productId");

      // Validate the productId
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid product ID",
          },
          400,
        );
      }

      // Get user info from context (set by isAuthenticated middleware)
      const { id: appUserId, storeId } = c.get("user");

      // Check if the product exists
      const product = await ProductRepository.findById(productId);
      if (!product) {
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404,
        );
      }

      // Add to wishlist
      const wishlistItem = await WishlistRepository.add({
        storeId,
        appUserId,
        productId,
      });

      return c.json({
        status: "success",
        message: "Product added to wishlist",
        data: wishlistItem,
      });
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to add product to wishlist",
        },
        500,
      );
    }
  }

  static async removeFromWishlist(c: Context) {
    try {
      const productId = c.req.param("productId");

      // Validate the productId
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid product ID",
          },
          400,
        );
      }

      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Remove from wishlist
      const removed = await WishlistRepository.remove(
        productId,
        appUserId,
        storeId,
      );

      if (!removed || removed.length === 0) {
        return c.json(
          {
            status: "error",
            message: "Product not found in wishlist",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        message: "Product removed from wishlist",
      });
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to remove product from wishlist",
        },
        500,
      );
    }
  }

  static async getWishlist(c: Context) {
    try {
      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Get the user's wishlist
      const wishlist = await WishlistRepository.findByUser(appUserId, storeId);

      return c.json({
        status: "success",
        data: wishlist,
      });
    } catch (error) {
      console.error("Error in getWishlist:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch wishlist",
        },
        500,
      );
    }
  }
}
