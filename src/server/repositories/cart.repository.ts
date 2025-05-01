import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppCart } from "@/lib/db/schema";

type VariantObject = Record<string, string | number | boolean | null>;

export class CartRepository {
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

  static async add(data: {
    storeId: string;
    appUserId: string;
    productId: string;
    quantity: number;
    variants?: VariantObject;
  }) {
    try {
      const { storeId, appUserId, productId, quantity, variants = {} } = data;
      const existing = await this.findByProductAndUser(
        productId,
        appUserId,
        storeId,
      );
      if (existing) {
        return await db
          .update(AppCart)
          .set({
            quantity: existing.quantity + quantity,
            variants,
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

  static async update(
    productId: string,
    appUserId: string,
    storeId: string,
    quantity: number,
    variants?: VariantObject,
  ) {
    try {
      const updateData: {
        quantity: number;
        updated_at: Date;
        variants?: VariantObject;
      } = {
        quantity,
        updated_at: new Date(),
      };
      if (variants) updateData.variants = variants;
      return await db
        .update(AppCart)
        .set(updateData)
        .where(
          and(
            eq(AppCart.product_id, productId),
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

  static async remove(productId: string, appUserId: string, storeId: string) {
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

  static async findByUser(appUserId: string, storeId: string) {
    try {
      return await db.query.AppCart.findMany({
        where: and(
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
        ),
        with: { product: true },
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new Error("Failed to fetch cart");
    }
  }

  static async clearCart(appUserId: string, storeId: string) {
    try {
      return await db
        .delete(AppCart)
        .where(
          and(eq(AppCart.appUserId, appUserId), eq(AppCart.storeId, storeId)),
        )
        .returning();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }
}
