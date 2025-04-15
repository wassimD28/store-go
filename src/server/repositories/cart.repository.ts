import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppCart } from "@/lib/db/schema";

// Define a proper type for variants
type VariantObject = Record<string, string | number | boolean | null>;

export class CartRepository {
  // Check if a product is in the user's cart
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

  // Add a product to the cart
  static async add(data: {
    storeId: string;
    appUserId: string;
    productId: string;
    quantity: number;
    variants?: VariantObject;
  }) {
    try {
      const { storeId, appUserId, productId, quantity, variants = {} } = data;

      // Check if already in cart
      const existing = await this.findByProductAndUser(
        productId,
        appUserId,
        storeId,
      );
      
      if (existing) {
        // Update quantity instead of adding new item
        return await db
          .update(AppCart)
          .set({
            quantity: existing.quantity + quantity,
            variants: variants,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(AppCart.product_id, productId),
              eq(AppCart.appUserId, appUserId),
              eq(AppCart.storeId, storeId),
            )
          )
          .returning();
      }

      // Add to cart
      return await db
        .insert(AppCart)
        .values({
          storeId,
          appUserId,
          product_id: productId,
          quantity,
          variants,
        })
        .returning();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  // Update cart item quantity
  static async update(
    productId: string, 
    appUserId: string, 
    storeId: string,
    quantity: number,
    variants?: VariantObject
  ) {
    try {
      // Define proper type for updateData
      interface UpdatePayload {
        quantity: number;
        updated_at: Date;
        variants?: VariantObject;
      }

      const updateData: UpdatePayload = {
        quantity,
        updated_at: new Date(),
      };

      if (variants) {
        updateData.variants = variants;
      }

      return await db
        .update(AppCart)
        .set(updateData)
        .where(
          and(
            eq(AppCart.product_id, productId),
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          )
        )
        .returning();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  // Remove a product from the cart
  static async remove(productId: string, appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(
            eq(AppCart.product_id, productId),
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          )
        )
        .returning();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw new Error("Failed to remove item from cart");
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

  // Clear user's cart
  static async clearCart(appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(
            eq(AppCart.appUserId, appUserId),
            eq(AppCart.storeId, storeId),
          )
        )
        .returning();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }
}