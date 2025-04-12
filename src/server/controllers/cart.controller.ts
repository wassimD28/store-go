// src/server/controllers/cart.controller.ts

import { Context } from "hono";
import { CartRepository } from "@/server/repositories/cart.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";
import { cartItemSchema } from "../schemas/cart.shema";

export class CartController {
  static async addToCart(c: Context) {
    try {
      // Validate request body
      const body = await c.req.json();
      const result = cartItemSchema.safeParse(body);
      
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request data",
            errors: result.error.format(),
          },
          400,
        );
      }
      
      const { productId, quantity, variants } = result.data;

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

      // Check if there's enough stock
      if (product.stock_quantity < quantity) {
        return c.json(
          {
            status: "error",
            message: "Not enough stock available",
          },
          400,
        );
      }

      // Add to cart
      const cartItem = await CartRepository.addOrUpdate({
        storeId,
        appUserId,
        productId,
        quantity,
        variants: variants || {},
      });

      return c.json({
        status: "success",
        message: "Product added to cart",
        data: {
          id: cartItem[0].id,
          productId: cartItem[0].product_id,
          name: product.name,
          price: parseFloat(product.price.toString()),
          quantity: cartItem[0].quantity,
          variants: cartItem[0].variants,
          // Fix for 'product.image_urls' is of type 'unknown'
          image: Array.isArray(product.image_urls) && product.image_urls.length > 0 
            ? product.image_urls[0] 
            : "",
        },
      }, 201);
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
      const itemId = c.req.param("itemId");
      
      // Validate the itemId
      const validId = idSchema.safeParse(itemId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid item ID",
          },
          400,
        );
      }

      // Validate request body
      const body = await c.req.json();
      const result = cartItemSchema.safeParse(body);
      
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request data",
            errors: result.error.format(),
          },
          400,
        );
      }
      
      const { quantity, variants } = result.data;

      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Check if cart item exists
      const cartItem = await CartRepository.findById(itemId, appUserId, storeId);
      if (!cartItem) {
        return c.json(
          {
            status: "error",
            message: "Cart item not found",
          },
          404,
        );
      }

      // Check if the product exists
      const product = await ProductRepository.findById(cartItem.product_id);
      if (!product) {
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404,
        );
      }

      // Check if there's enough stock
      if (product.stock_quantity < quantity) {
        return c.json(
          {
            status: "error",
            message: "Not enough stock available",
          },
          400,
        );
      }

      // Update cart item
      await CartRepository.update(
        itemId,
        appUserId,
        storeId,
        quantity,
        // Fix for type error - ensure variants is a Record<string, string>
        variants || (cartItem.variants as Record<string, string>) || {},
      );

      return c.json({
        status: "success",
        message: "Cart item updated",
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
      const itemId = c.req.param("itemId");

      // Validate the itemId
      const validId = idSchema.safeParse(itemId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid item ID",
          },
          400,
        );
      }

      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Remove from cart
      const removed = await CartRepository.removeById(
        itemId,
        appUserId,
        storeId,
      );

      if (!removed || removed.length === 0) {
        return c.json(
          {
            status: "error",
            message: "Item not found in cart",
          },
          404,
        );
      }

      // Fix for the 204 status code error - either use 200 or don't include a body
      return c.json({
        status: "success",
        message: "Item removed from cart",
      });
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to remove item from cart",
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
      const cartItems = await CartRepository.findByUser(appUserId, storeId);

      // Format response to match Flutter CartItem model
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.product.name,
        price: parseFloat(item.product.price.toString()),
        quantity: item.quantity,
        variants: item.variants,
        // Fix for 'item.product.image_urls' is of type 'unknown'
        image: Array.isArray(item.product.image_urls) && item.product.image_urls.length > 0 
          ? item.product.image_urls[0] 
          : "",
      }));

      return c.json({
        status: "success",
        data: formattedItems,
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

  static async clearCart(c: Context) {
    try {
      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");

      // Clear the user's cart
      await CartRepository.clearCart(appUserId, storeId);

      // Fix for the 204 status code error - either use 200 or don't include a body
      return c.json({
        status: "success",
        message: "Cart cleared successfully",
      });
    } catch (error) {
      console.error("Error in clearCart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to clear cart",
        },
        500,
      );
    }
  }

  static async applyCoupon(c: Context) {
    try {
      // Get user info from context
      const { id: appUserId, storeId } = c.get("user");
      
      // Validate request body
      const body = await c.req.json();
      const result = z.object({
        code: z.string().min(3),
      }).safeParse(body);
      
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid coupon code",
          },
          400,
        );
      }
      
      const { code } = result.data;

      // In a real implementation, you would check the coupon against a database
      // For now, we'll simulate a fixed discount based on the coupon code
      let discount = 0;
      
      if (code === "WELCOME10") {
        discount = 10; // 10% discount
      } else if (code === "SUMMER20") {
        discount = 20; // 20% discount
      } else if (code === "FLASH50") {
        discount = 50; // 50% discount (flash sale)
      }

      return c.json({
        status: "success",
        message: discount > 0 ? "Coupon applied successfully" : "Invalid coupon code",
        data: {
          discount: discount,
          code: code,
        },
      });
    } catch (error) {
      console.error("Error in applyCoupon:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to apply coupon",
        },
        500,
      );
    }
  }
}