import { Context } from "hono";
import { CartRepository } from "@/server/repositories/cart.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  variants: z.record(z.any()).optional(),
});

export class CartController {
  static async getCart(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Fetch cart with items and calculate summary
      const result = await CartRepository.findByUser(appUserId, storeId);

      if (!result || !result.cart) {
        return c.json({
          status: "success",
          data: {
            cartId: null,
            items: [],
            summary: {
              totalItems: 0,
              subtotal: 0,
              tax: 0,
              shippingCost: 0,
              totalAmount: 0,
            },
          },
        });
      }

      const { cart, items, summary } = result;

      // Format cart items for consistent API response
      const formattedItems = items.map((item) => ({
        id: item.id,
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
        variants: item.variants || {},
        addedAt: item.added_at,
        updatedAt: item.updated_at,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          imageUrls: item.product.image_urls || [],
          stockQuantity: item.product.stock_quantity || 0,
        },
      }));

      // Calculate cart totals with appropriate rounding
      const taxRate = 0.1; // 10% tax rate - could be configurable
      const tax = Math.round(summary.subtotal * taxRate * 100) / 100;

      // Free shipping threshold could be configured per store
      const shippingCost = summary.subtotal >= 50 ? 0 : 15.0;

      // Return cart data with consistent response structure
      return c.json({
        status: "success",
        data: {
          cartId: cart.id,
          items: formattedItems,
          summary: {
            totalItems: summary.totalItems,
            subtotal: summary.subtotal,
            tax,
            shippingCost,
            totalAmount:
              Math.round((summary.subtotal + tax + shippingCost) * 100) / 100,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch cart",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }

  static async addToCart(c: Context) {
    try {
      // Get productId from URL path parameter (not from body)
      const productId = c.req.param("productId");

      const body = await c.req.json();
      const { quantity = 1, variants = {}, selectedColor, selectedSize } = body;

      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid product ID" }, 400);
      }

      if (typeof quantity !== "number" || quantity <= 0) {
        return c.json(
          { status: "error", message: "Quantity must be a positive number" },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user");
      const product = await ProductRepository.findById(productId);
      if (!product) {
        return c.json({ status: "error", message: "Product not found" }, 404);
      }

      // Normalize variants - handle both old format (selectedColor, selectedSize) and new format (variants)
      let normalizedVariants = variants;
      if (selectedColor || selectedSize) {
        normalizedVariants = {
          ...normalizedVariants,
          ...(selectedColor && { color: selectedColor }),
          ...(selectedSize && { size: selectedSize }),
        };
      }

      const cartItem = await CartRepository.add({
        storeId,
        appUserId,
        productId,
        quantity,
        variants: normalizedVariants,
      });

      return c.json({
        status: "success",
        message: "Product added to cart",
        data: cartItem,
      });
    } catch (error) {
      console.error("Error in addToCart:", error);
      return c.json(
        { status: "error", message: "Failed to add product to cart" },
        500,
      );
    }
  }

  // Add new method to get cart items for promotion checking
  static async getCartForPromotions(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      const cartItems = await CartRepository.getCartItemsForPromotions(
        appUserId,
        storeId,
      );

      return c.json({
        status: "success",
        data: {
          cartItems,
        },
      });
    } catch (error) {
      console.error("Error in getCartForPromotions:", error);
      return c.json(
        { status: "error", message: "Failed to get cart for promotions" },
        500,
      );
    }
  }

  static async getCartItemById(c: Context) {
    try {
      const itemId = c.req.param("itemId");
      const validId = idSchema.safeParse(itemId);
      if (!validId.success) {
        return c.json(
          { status: "error", message: "Invalid cart item ID" },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user");
      const cartItem = await CartRepository.findCartItemById(itemId);

      if (!cartItem) {
        return c.json({ status: "error", message: "Cart item not found" }, 404);
      }

      // Verify that this cart item belongs to the authenticated user's cart
      const userCart = await CartRepository.findOrCreateCart(
        appUserId,
        storeId,
      );
      if (cartItem.cartId !== userCart.id) {
        return c.json(
          {
            status: "error",
            message: "You don't have permission to access this cart item",
          },
          403,
        );
      }

      return c.json({
        status: "success",
        data: cartItem,
      });
    } catch (error) {
      console.error("Error in getCartItemById:", error);
      return c.json(
        { status: "error", message: "Failed to fetch cart item" },
        500,
      );
    }
  }

  static async updateCartItem(c: Context) {
    try {
      const itemId = c.req.param("itemId");
      const validId = idSchema.safeParse(itemId);
      if (!validId.success) {
        return c.json(
          { status: "error", message: "Invalid cart item ID" },
          400,
        );
      }

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
      const { id: appUserId, storeId } = c.get("user");

      // Verify the item exists and belongs to user
      const cartItem = await CartRepository.findCartItemById(itemId);
      if (!cartItem) {
        return c.json({ status: "error", message: "Cart item not found" }, 404);
      }

      // Verify item belongs to user's active cart
      const userCart = await CartRepository.findOrCreateCart(
        appUserId,
        storeId,
      );
      if (cartItem.cartId !== userCart.id) {
        return c.json(
          {
            status: "error",
            message: "You don't have permission to update this cart item",
          },
          403,
        );
      }

      // Update the cart item
      const updated = await CartRepository.updateCartItem(
        itemId,
        quantity,
        variants,
      );

      return c.json({
        status: "success",
        message: "Cart item updated",
        data: updated,
      });
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return c.json(
        { status: "error", message: "Failed to update cart item" },
        500,
      );
    }
  }

  static async removeCartItem(c: Context) {
    try {
      const itemId = c.req.param("itemId");
      const validId = idSchema.safeParse(itemId);
      if (!validId.success) {
        return c.json(
          { status: "error", message: "Invalid cart item ID" },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user");

      // Verify the item exists and belongs to user
      const cartItem = await CartRepository.findCartItemById(itemId);
      if (!cartItem) {
        return c.json({ status: "error", message: "Cart item not found" }, 404);
      }

      // Verify item belongs to user's active cart
      const userCart = await CartRepository.findOrCreateCart(
        appUserId,
        storeId,
      );
      if (cartItem.cartId !== userCart.id) {
        return c.json(
          {
            status: "error",
            message: "You don't have permission to remove this cart item",
          },
          403,
        );
      }

      // Remove the cart item
      await CartRepository.removeCartItem(itemId);

      return c.json({
        status: "success",
        message: "Product removed from cart",
      });
    } catch (error) {
      console.error("Error in removeCartItem:", error);
      return c.json(
        { status: "error", message: "Failed to remove product from cart" },
        500,
      );
    }
  }

  static async clearCart(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");
      await CartRepository.clearCart(appUserId, storeId);
      return c.json({
        status: "success",
        message: "Cart cleared successfully",
      });
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
        return c.json(
          { status: "error", message: "Coupon code required" },
          400,
        );
      }

      // Placeholder logic: Replace with actual coupon validation
      const discount = 10.0;
      return c.json({ status: "success", data: { discount } });
    } catch (error) {
      console.error("Error in applyCoupon:", error);
      return c.json(
        { status: "error", message: "Failed to apply coupon" },
        500,
      );
    }
  }

  static async removeFromCart(c: Context) {
    try {
      const productId = c.req.param("productId");
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid product ID" }, 400);
      }

      // Get variants from request body if provided
      const body = await c.req.json().catch(() => ({}));
      const { variants } = body;

      const { id: appUserId, storeId } = c.get("user");

      // Remove the cart item by product ID and variants
      await CartRepository.removeByProductId(
        productId,
        appUserId,
        storeId,
        variants,
      );

      return c.json({
        status: "success",
        message: "Product removed from cart",
      });
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      if (error instanceof Error && error.message === "Cart item not found") {
        return c.json({ status: "error", message: "Cart item not found" }, 404);
      }
      return c.json(
        { status: "error", message: "Failed to remove product from cart" },
        500,
      );
    }
  }

  static async updateCartItemByProductId(c: Context) {
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
          {
            status: "error",
            message: "Invalid request data",
            details: validationResult.error.format(),
          },
          400,
        );
      }

      const { quantity, variants } = validationResult.data;
      const { id: appUserId, storeId } = c.get("user");

      // Update the cart item by product ID and variants
      const updated = await CartRepository.updateByProductId(
        productId,
        appUserId,
        storeId,
        quantity,
        variants,
      );

      return c.json({
        status: "success",
        message: "Cart item updated",
        data: updated,
      });
    } catch (error) {
      console.error("Error in updateCartItemByProductId:", error);
      if (error instanceof Error && error.message === "Cart item not found") {
        return c.json({ status: "error", message: "Cart item not found" }, 404);
      }
      return c.json(
        { status: "error", message: "Failed to update cart item" },
        500,
      );
    }
  }

  static async getCartSummary(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Fetch cart with items
      const result = await CartRepository.findByUser(appUserId, storeId);

      if (!result || !result.cart) {
        return c.json({
          status: "success",
          data: {
            summary: {
              totalItems: 0,
              subtotal: 0,
              tax: 0,
              shippingCost: 0,
              discount: 0,
              totalAmount: 0,
            },
            eligibleForFreeShipping: false,
            freeShippingThreshold: 50,
          },
        });
      }

      const { summary } = result;

      // Calculate cart totals with appropriate rounding
      const taxRate = 0.1; // 10% tax rate - could be configurable per store
      const tax = Math.round(summary.subtotal * taxRate * 100) / 100;

      // Free shipping threshold could be configured per store
      const freeShippingThreshold = 50.0;
      const shippingCost = summary.subtotal >= freeShippingThreshold ? 0 : 15.0;
      const discount = 0; // Will be calculated based on applied promotions

      const totalAmount =
        Math.round((summary.subtotal + tax + shippingCost - discount) * 100) /
        100;

      return c.json({
        status: "success",
        data: {
          summary: {
            totalItems: summary.totalItems,
            subtotal: summary.subtotal,
            tax,
            shippingCost,
            discount,
            totalAmount,
          },
          eligibleForFreeShipping: summary.subtotal >= freeShippingThreshold,
          freeShippingThreshold,
          amountNeededForFreeShipping: Math.max(
            0,
            freeShippingThreshold - summary.subtotal,
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching cart summary:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch cart summary",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }

  static async validateCart(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Fetch cart with items
      const result = await CartRepository.findByUser(appUserId, storeId);

      if (!result || !result.items.length) {
        return c.json(
          {
            status: "error",
            message: "Cart is empty",
          },
          400,
        );
      }

      const validationErrors = [];
      const updatedItems = [];

      // Validate each cart item
      for (const item of result.items) {
        const product = item.product;

        console.log(`🔍 Validating product:`, {
          productId: item.productId,
          productName: product?.name,
          productStatus: product?.status,
          stockQuantity: product?.stock_quantity,
          requestedQuantity: item.quantity,
        }); // Debug log

        if (!product) {
          validationErrors.push({
            itemId: item.id,
            productId: item.productId,
            error: "Product not found",
            action: "remove",
          });
          continue;
        }

        // Check correct product status values from your enum
        if (product.status !== "published") {
          console.log(`❌ Product status invalid:`, {
            productId: item.productId,
            currentStatus: product.status,
            requiredStatus: "published",
          }); // Debug log

          validationErrors.push({
            itemId: item.id,
            productId: item.productId,
            productName: product.name,
            error: `Product is ${product.status}. Only published products are available for purchase.`,
            action: "remove",
          });
          continue;
        }

        // Check stock availability
        if (product.stock_quantity < item.quantity) {
          validationErrors.push({
            itemId: item.id,
            productId: item.productId,
            productName: product.name,
            error: `Insufficient stock. Only ${product.stock_quantity} available`,
            requestedQuantity: item.quantity,
            availableQuantity: product.stock_quantity,
            action: "update_quantity",
          });
          continue;
        }

        console.log(`✅ Product validation passed:`, item.productId); // Debug log
        updatedItems.push(item);
      }

      return c.json({
        status: validationErrors.length > 0 ? "validation_errors" : "success",
        data: {
          isValid: validationErrors.length === 0,
          validationErrors,
          validItems: updatedItems.length,
          totalItems: result.items.length,
        },
      });
    } catch (error) {
      console.error("Error validating cart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to validate cart",
        },
        500,
      );
    }
  }
}
