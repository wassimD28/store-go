// src/server/repositories/cart.repository.ts

import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppCart } from "@/lib/db/schema";

export class CartRepository {
  // Find cart item by ID
  static async findById(
    id: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      return await db.query.AppCart.findFirst({
        where: and(
          eq(AppCart.id, id),
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error("Error finding cart item by ID:", error);
      throw new Error("Failed to find cart item");
    }
  }

  // Find cart item by product and user
  static async findByProductAndUser(
    productId: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      return await db.query.AppCart.findFirst({
        where: and(
          eq(AppCart.product_id, productId),
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error("Error checking cart item:", error);
      throw new Error("Failed to check cart");
    }
  }

  // Add or update item in cart
  static async addOrUpdate(data: {
    storeId: string;
    appUserId: string;
    productId: string;
    quantity: number;
    variants?: Record<string, string>;
  }) {
    try {
      const { storeId, appUserId, productId, quantity, variants } = data;

      // Check if already in cart
      const existing = await this.findByProductAndUser(
        productId,
        appUserId,
        storeId,
      );

      if (existing) {
        // Update existing cart item
        return await db
          .update(AppCart)
          .set({
            quantity: quantity,
            variants: variants || existing.variants,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(AppCart.product_id, productId),
              eq(AppCart.appUserId, appUserId),
              eq(AppCart.storeId, storeId),
            ),
          )
          .returning();
      }

      // Add new item to cart
      return await db
        .insert(AppCart)
        .values({
          storeId,
          appUserId,
          product_id: productId,
          quantity,
          variants: variants || {},
        })
        .returning();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  // Update an existing cart item
  static async update(
    id: string,
    appUserId: string,
    storeId: string,
    quantity: number,
    variants: Record<string, string>,
  ) {
    try {
      return await db
        .update(AppCart)
        .set({
          quantity: quantity,
          variants: variants,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(AppCart.id, id),
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          ),
        )
        .returning();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  // Remove an item from cart by ID
  static async removeById(id: string, appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(
            eq(AppCart.id, id),
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          ),
        )
        .returning();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  // Remove an item from cart by product ID
  static async removeByProductId(productId: string, appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(
            eq(AppCart.product_id, productId),
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          ),
        )
        .returning();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  // Clear all items from cart
  static async clearCart(appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          ),
        )
        .returning();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }

  // Get all cart items for a user
  static async findByUser(appUserId: string, storeId: string) {
    try {
      return await db.query.AppCart.findMany({
        where: and(
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
        ),
        with: {
          product: true,
        },
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new Error("Failed to fetch cart");
    }
  }
}