import { Context } from "hono";
import { CartRepository } from "@/server/repositories/cart.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";

// Schema for validating cart item updates
const cartItemSchema = z.object({
  quantity: z.number().int().positive(),
  variants: z.record(z.any()).optional(),
});

export class CartController {
  static async addToCart(c: Context) {
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

      // Parse request body
      const body = await c.req.json();
      const { quantity = 1, variants = {} } = body;

      // Validate quantity
      if (typeof quantity !== 'number' || quantity <= 0) {
        return c.json(
          {
            status: "error",
            message: "Quantity must be a positive number",
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

      // Add to cart
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
      return c.json(
        {
          status: "error",
          message: "Failed to add product to cart",
        },
        500,
      );
    }
  }

  static async updateCartItem(c: Context) {
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

      // Parse and validate request body
      const body = await c.req.json();
      const validationResult = cartItemSchema.safeParse(body);
      
      if (!validationResult.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request data",
            details: validationResult.error.format(),
          },
          400,
        );
      }

      const { quantity, variants } = validationResult.data;

      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Check if the item exists in cart
      const existingItem = await CartRepository.findByProductAndUser(
        productId,
        appUserId,
        storeId
      );

      if (!existingItem) {
        return c.json(
          {
            status: "error",
            message: "Product not found in cart",
          },
          404,
        );
      }

      // Update cart item
      const updated = await CartRepository.update(
        productId,
        appUserId,
        storeId,
        quantity,
        variants
      );

      return c.json({
        status: "success",
        message: "Cart item updated",
        data: updated,
      });
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to update cart item",
        },
        500,
      );
    }
  }

  static async removeFromCart(c: Context) {
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

      // Remove from cart
      const removed = await CartRepository.remove(
        productId,
        appUserId,
        storeId,
      );

      if (!removed || removed.length === 0) {
        return c.json(
          {
            status: "error",
            message: "Product not found in cart",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        message: "Product removed from cart",
      });
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to remove product from cart",
        },
        500,
      );
    }
  }

  static async getCart(c: Context) {
    try {
      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Get the user's cart
      const cart = await CartRepository.findByUser(appUserId, storeId);

      return c.json({
        status: "success",
        data: cart,
      });
    } catch (error) {
      console.error("Error in getCart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch cart",
        },
        500,
      );
    }
  }
}