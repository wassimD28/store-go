import { Context } from "hono";
import { CartRepository } from "@/server/repositories/cart.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";

const cartItemSchema = z.object({
  quantity: z.number().int().positive(),
  variants: z.record(z.any()).optional(),
});

export class CartController {
  static async getCart(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");
      const cart = await CartRepository.findByUser(appUserId, storeId);
      return c.json({ status: "success", data: cart });
    } catch (error) {
      console.error("Error in getCart:", error);
      return c.json({ status: "error", message: "Failed to fetch cart" }, 500);
    }
  }

  // Other methods (addToCart, updateCartItem, etc.) remain unchanged
  static async addToCart(c: Context) {
    try {
      const productId = c.req.param("productId");
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid product ID" }, 400);
      }

      const body = await c.req.json();
      const { quantity = 1, variants = {} } = body;
      if (typeof quantity !== "number" || quantity <= 0) {
        return c.json({ status: "error", message: "Quantity must be a positive number" }, 400);
      }

      const { id: appUserId, storeId } = c.get("user");
      const product = await ProductRepository.findById(productId);
      if (!product) {
        return c.json({ status: "error", message: "Product not found" }, 404);
      }

      const cartItem = await CartRepository.add({
        storeId,
        appUserId,
        productId,
        quantity,
        variants,
      });

      return c.json({
        status: "success",
        message: "Product added to cart",
        data: cartItem,
      });
    } catch (error) {
      console.error("Error in addToCart:", error);
      return c.json({ status: "error", message: "Failed to add product to cart" }, 500);
    }
  }

  static async updateCartItem(c: Context) {
    try {
      const productId = c.req.param("productId");
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid product ID" }, 400);
      }

      const body = await c.req.json();
      const validationResult = cartItemSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json(
          { status: "error", message: "Invalid request data", details: validationResult.error.format() },
          400
        );
      }

      const { quantity, variants } = validationResult.data;
      const { id: appUserId, storeId } = c.get("user");
      const existingItem = await CartRepository.findByProductAndUser(productId, appUserId, storeId);
      if (!existingItem) {
        return c.json({ status: "error", message: "Product not found in cart" }, 404);
      }

      const updated = await CartRepository.update(productId, appUserId, storeId, quantity, variants);
      return c.json({
        status: "success",
        message: "Cart item updated",
        data: updated,
      });
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return c.json({ status: "error", message: "Failed to update cart item" }, 500);
    }
  }

  static async removeFromCart(c: Context) {
    try {
      const productId = c.req.param("productId");
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid product ID" }, 400);
      }

      const { id: appUserId, storeId } = c.get("user");
      const removed = await CartRepository.remove(productId, appUserId, storeId);
      if (!removed || removed.length === 0) {
        return c.json({ status: "error", message: "Product not found in cart" }, 404);
      }

      return c.json({ status: "success", message: "Product removed from cart" });
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      return c.json({ status: "error", message: "Failed to remove product from cart" }, 500);
    }
  }

  static async clearCart(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");
      await CartRepository.clearCart(appUserId, storeId);
      return c.json({ status: "success", message: "Cart cleared successfully" });
    } catch (error) {
      console.error("Error in clearCart:", error);
      return c.json({ status: "error", message: "Failed to clear cart" }, 500);
    }
  }

  static async applyCoupon(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");
      const { code } = await c.req.json();
      if (!code) {
        return c.json({ status: "error", message: "Coupon code required" }, 400);
      }

      // Placeholder logic: Replace with actual coupon validation
      const discount = 10.0;
      return c.json({ status: "success", data: { discount } });
    } catch (error) {
      console.error("Error in applyCoupon:", error);
      return c.json({ status: "error", message: "Failed to apply coupon" }, 500);
    }
  }
}