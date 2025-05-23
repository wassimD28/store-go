import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppCart, CartItem } from "@/lib/db/schema";
import { z } from "zod";

// Add the missing VariantObject type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariantObject = Record<string, any>;

// Helper function to compare variants
function areVariantsEqual(
  variants1: VariantObject,
  variants2: VariantObject,
): boolean {
  // Handle null/undefined cases
  const v1 = variants1 || {};
  const v2 = variants2 || {};

  // Get sorted keys
  const keys1 = Object.keys(v1).sort();
  const keys2 = Object.keys(v2).sort();

  // Quick length check
  if (keys1.length !== keys2.length) return false;

  // Compare each key-value pair
  for (const key of keys1) {
    if (v1[key] !== v2[key]) return false;
  }

  return true;
}

export class CartRepository {
  // Find or create cart for a user
  static async findOrCreateCart(appUserId: string, storeId: string) {
    try {
      console.log(
        `🔍 Looking for cart: userId=${appUserId}, storeId=${storeId}`,
      ); // Debug log

      // Try to find existing active cart - ensure we get the SAME cart every time
      let cart = await db.query.AppCart.findFirst({
        where: and(
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
          eq(AppCart.status, "active"), // Only get active carts
        ),
        orderBy: (cart, { desc }) => [desc(cart.created_at)], // Get the most recent cart if multiple exist
      });

      console.log(`📦 Found existing cart:`, cart?.id); // Debug log

      // If no active cart exists, create one
      if (!cart) {
        console.log(
          `🆕 Creating new cart for userId=${appUserId}, storeId=${storeId}`,
        ); // Debug log

        const newCarts = await db
          .insert(AppCart)
          .values({
            appUserId,
            storeId,
            status: "active", // Explicitly set active status
          })
          .returning();
        cart = newCarts[0];

        console.log(`✅ Created new cart:`, cart.id); // Debug log
      }

      return cart;
    } catch (error) {
      console.error("Error finding or creating cart:", error);
      throw new Error("Failed to initialize cart");
    }
  }

  // Add method to convert cart to order
  static async convertCartToOrder(cartId: string) {
    try {
      const [updatedCart] = await db
        .update(AppCart)
        .set({
          status: "converted",
          updated_at: new Date(),
        })
        .where(eq(AppCart.id, cartId))
        .returning();

      return updatedCart;
    } catch (error) {
      console.error("Error converting cart to order:", error);
      throw new Error("Failed to convert cart to order");
    }
  }

  // Add method to mark cart as abandoned (for analytics)
  static async markCartAsAbandoned(cartId: string) {
    try {
      const [updatedCart] = await db
        .update(AppCart)
        .set({
          status: "abandoned",
          updated_at: new Date(),
        })
        .where(eq(AppCart.id, cartId))
        .returning();

      return updatedCart;
    } catch (error) {
      console.error("Error marking cart as abandoned:", error);
      throw new Error("Failed to mark cart as abandoned");
    }
  }

  // Add method to find carts by status (for analytics)
  static async findCartsByStatus(
    storeId: string,
    status: "active" | "abandoned" | "converted" | "expired" | "merged",
  ) {
    try {
      return await db.query.AppCart.findMany({
        where: and(eq(AppCart.storeId, storeId), eq(AppCart.status, status)),
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error fetching ${status} carts:`, error);
      throw new Error(`Failed to fetch ${status} carts`);
    }
  }

  static async findCartItemByProductAndUser(
    productId: string,
    appUserId: string,
    storeId: string,
    variants?: VariantObject,
  ) {
    try {
      // Find user's cart
      const cart = await this.findOrCreateCart(appUserId, storeId);

      // Get all cart items for this product
      const cartItems = await db.query.CartItem.findMany({
        where: and(
          eq(CartItem.cartId, cart.id),
          eq(CartItem.productId, productId),
        ),
      });

      // If variants are specified, find exact match
      if (variants && Object.keys(variants).length > 0) {
        return (
          cartItems.find((item) => {
            const itemVariants = (item.variants as VariantObject) || {};
            return areVariantsEqual(itemVariants, variants);
          }) || null
        );
      }

      // If no variants specified, return first item (for backward compatibility)
      return cartItems[0] || null;
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

      console.log(
        `🛒 Adding to cart: productId=${productId}, userId=${appUserId}, storeId=${storeId}`,
      ); // Debug log

      // Get the user's cart - this should be the SAME cart returned in getCart
      const cart = await this.findOrCreateCart(appUserId, storeId);
      console.log("🎯 Using cart ID for add:", cart.id); // Debug log

      // Check if the product with these specific variants already exists in the cart
      const existingItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (existingItem) {
        console.log("🔄 Updating existing item:", existingItem.id); // Debug log

        // Update existing cart item quantity (keep existing variants)
        const updated = await db
          .update(CartItem)
          .set({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date(),
          })
          .where(eq(CartItem.id, existingItem.id))
          .returning();

        console.log("✅ Updated existing item in cart:", existingItem.cartId); // Debug log
        return updated;
      }

      console.log("➕ Creating new cart item"); // Debug log

      // Add new cart item with variants - ENSURE it uses the correct cartId
      const newItem = await db
        .insert(CartItem)
        .values({
          cartId: cart.id, // This MUST match the cart from findOrCreateCart
          productId,
          quantity,
          variants: Object.keys(variants).length > 0 ? variants : null,
        })
        .returning();

      console.log(
        "✅ Created new item in cart:",
        cart.id,
        "Item cartId:",
        newItem[0]?.cartId,
      ); // Debug log

      // Verify the item was created with correct cartId
      if (newItem[0]?.cartId !== cart.id) {
        console.error("❌ Cart ID mismatch!", {
          expected: cart.id,
          actual: newItem[0]?.cartId,
        });
        throw new Error("Cart ID mismatch during item creation");
      }

      return newItem;
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
      // Find the specific cart item with these variants
      const cartItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      const updateData: {
        quantity: number;
        updated_at: Date;
        variants?: VariantObject;
      } = {
        quantity,
        updated_at: new Date(),
      };

      // Only update variants if new ones are provided
      if (variants && Object.keys(variants).length > 0) {
        updateData.variants = variants;
      }

      return await db
        .update(CartItem)
        .set(updateData)
        .where(eq(CartItem.id, cartItem.id))
        .returning();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  static async remove(
    productId: string,
    appUserId: string,
    storeId: string,
    variants?: VariantObject,
  ) {
    try {
      // Find the specific cart item with these variants
      const cartItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      return await db
        .delete(CartItem)
        .where(eq(CartItem.id, cartItem.id))
        .returning();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  static async removeByProductId(
    productId: string,
    appUserId: string,
    storeId: string,
    variants?: VariantObject,
  ) {
    try {
      // Find the specific cart item with these variants
      const cartItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      return await db
        .delete(CartItem)
        .where(eq(CartItem.id, cartItem.id))
        .returning();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  static async updateByProductId(
    productId: string,
    appUserId: string,
    storeId: string,
    quantity: number,
    variants?: VariantObject,
  ) {
    try {
      // Find the specific cart item with these variants
      const cartItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      const updateData: {
        quantity: number;
        updated_at: Date;
        variants?: VariantObject;
      } = {
        quantity,
        updated_at: new Date(),
      };

      // Only update variants if new ones are provided
      if (variants && Object.keys(variants).length > 0) {
        updateData.variants = variants;
      }

      return await db
        .update(CartItem)
        .set(updateData)
        .where(eq(CartItem.id, cartItem.id))
        .returning();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  static async findByUser(appUserId: string, storeId: string) {
    try {
      console.log(
        `🔍 Finding cart for user: userId=${appUserId}, storeId=${storeId}`,
      ); // Debug log

      // Find the user's cart - this should be the SAME cart from add operation
      const cart = await this.findOrCreateCart(appUserId, storeId);
      console.log("📦 Found cart for findByUser:", cart.id); // Debug log

      // Get all items in the cart with product details
      const cartItems = await db.query.CartItem.findMany({
        where: eq(CartItem.cartId, cart.id),
        with: {
          product: {
            with: {
              category: true,
              subcategory: true,
            },
          },
        },
        orderBy: (cartItem, { desc }) => [desc(cartItem.updated_at)],
      });

      console.log(`📋 Found ${cartItems.length} items in cart ${cart.id}`); // Debug log

      // Calculate cart summary
      const summary = {
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cartItems.reduce((sum, item) => {
          const price = item.product?.price ? Number(item.product.price) : 0;
          return sum + price * item.quantity;
        }, 0),
        uniqueItems: cartItems.length, // Number of unique cart items
      };

      return {
        cart,
        items: cartItems,
        summary,
      };
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new Error("Failed to fetch cart");
    }
  }

  // Add method to get cart items formatted for promotions
  static async getCartItemsForPromotions(appUserId: string, storeId: string) {
    try {
      const result = await this.findByUser(appUserId, storeId);

      // Format cart items for promotion checking
      return result.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price ? Number(item.product.price) : 0,
        variantId: item.variants ? JSON.stringify(item.variants) : undefined,
        categoryId: item.product?.categoryId || undefined,
      }));
    } catch (error) {
      console.error("Error getting cart items for promotions:", error);
      throw new Error("Failed to get cart items for promotions");
    }
  }

  static async clearCart(appUserId: string, storeId: string) {
    try {
      // Find the user's cart
      const cart = await this.findOrCreateCart(appUserId, storeId);

      // Delete all items in the cart
      return await db
        .delete(CartItem)
        .where(eq(CartItem.cartId, cart.id))
        .returning();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }

  static async findCartItemById(cartItemId: string) {
    try {
      return await db.query.CartItem.findFirst({
        where: eq(CartItem.id, cartItemId),
        with: { product: true },
      });
    } catch (error) {
      console.error("Error fetching cart item:", error);
      throw new Error("Failed to fetch cart item");
    }
  }

  static async updateCartItem(
    cartItemId: string,
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
        .update(CartItem)
        .set(updateData)
        .where(eq(CartItem.id, cartItemId))
        .returning();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  static async removeCartItem(cartItemId: string) {
    try {
      return await db
        .delete(CartItem)
        .where(eq(CartItem.id, cartItemId))
        .returning();
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw new Error("Failed to remove cart item");
    }
  }
}
