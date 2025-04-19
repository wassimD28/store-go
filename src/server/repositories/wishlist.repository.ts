// src\server\repositories\wishlist.repository.ts

import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppWishlist } from "@/lib/db";

export class WishlistRepository {
  // Check if a product is in the user's wishlist
  static async findByProductAndUser(
    productId: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      return await db.query.AppWishlist.findFirst({
        where: and(
          eq(AppWishlist.product_id, productId),
          eq(AppWishlist.appUserId, appUserId),
          eq(AppWishlist.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error("Error checking wishlist item:", error);
      throw new Error("Failed to check wishlist");
    }
  }

  // Add a product to the wishlist
  static async add(data: {
    storeId: string;
    appUserId: string;
    productId: string;
  }) {
    try {
      const { storeId, appUserId, productId } = data;

      // Check if already in wishlist
      const existing = await this.findByProductAndUser(
        productId,
        appUserId,
        storeId,
      );
      if (existing) {
        return existing; // Already in wishlist
      }

      // Add to wishlist
      return await db
        .insert(AppWishlist)
        .values({
          storeId,
          appUserId,
          product_id: productId,
        })
        .returning();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw new Error("Failed to add item to wishlist");
    }
  }

  // Remove a product from the wishlist
  static async remove(productId: string, appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppWishlist)
        .where(
          and(
            eq(AppWishlist.product_id, productId),
            eq(AppWishlist.appUserId, appUserId),
            eq(AppWishlist.storeId, storeId),
          ),
        )
        .returning();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw new Error("Failed to remove item from wishlist");
    }
  }

  // Get all wishlist items for a user
  static async findByUser(appUserId: string, storeId: string) {
    try {
      return await db.query.AppWishlist.findMany({
        where: and(
          eq(AppWishlist.appUserId, appUserId),
          eq(AppWishlist.storeId, storeId),
        ),
        with: {
          product: true,
        },
      });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw new Error("Failed to fetch wishlist");
    }
  }
}
