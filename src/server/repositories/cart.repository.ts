import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppCart, CartItem } from "@/lib/db/schema";

type VariantObject = Record<string, string | number | boolean | null>;

export class CartRepository {
  // Find or create cart for a user
  static async findOrCreateCart(appUserId: string, storeId: string) {
    try {
      // Try to find existing active cart
      let cart = await db.query.AppCart.findFirst({
        where: and(
          eq(AppCart.appUserId, appUserId),
          eq(AppCart.storeId, storeId),
          eq(AppCart.status, "active"),
        ),
      });

      // If no active cart exists, create one
      if (!cart) {
        const newCarts = await db
          .insert(AppCart)
          .values({
            appUserId,
            storeId,
            status: "active",
          })
          .returning();
        cart = newCarts[0];
      }

      return cart;
    } catch (error) {
      console.error("Error finding or creating cart:", error);
      throw new Error("Failed to initialize cart");
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

      // Find specific cart item - if variants are provided, match them exactly
      if (variants && Object.keys(variants).length > 0) {
        // For variant-specific search, we need to check both productId and variants
        const cartItems = await db.query.CartItem.findMany({
          where: and(
            eq(CartItem.cartId, cart.id),
            eq(CartItem.productId, productId),
          ),
        });

        // Find the item with matching variants
        const matchingItem = cartItems.find((item) => {
          const itemVariants = item.variants as VariantObject || {};
          return JSON.stringify(itemVariants) === JSON.stringify(variants);
        });

        return matchingItem || null;
      }

      // For non-variant search, find any item with this product
      return await db.query.CartItem.findFirst({
        where: and(
          eq(CartItem.cartId, cart.id),
          eq(CartItem.productId, productId),
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

      // Get the user's cart
      const cart = await this.findOrCreateCart(appUserId, storeId);

      // Check if the product with these specific variants already exists in the cart
      const existingItem = await this.findCartItemByProductAndUser(
        productId,
        appUserId,
        storeId,
        variants,
      );

      if (existingItem) {
        // Update existing cart item quantity (keep existing variants)
        return await db
          .update(CartItem)
          .set({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date(),
          })
          .where(eq(CartItem.id, existingItem.id))
          .returning();
      }

      // Add new cart item with variants
      return await db
        .insert(CartItem)
        .values({
          cartId: cart.id,
          productId,
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

  static async remove(productId: string, appUserId: string, storeId: string, variants?: VariantObject) {
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

  static async removeByProductId(productId: string, appUserId: string, storeId: string, variants?: VariantObject) {
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
      // Find the user's cart
      const cart = await this.findOrCreateCart(appUserId, storeId);

      // Get all items in the cart with product details
      const cartItems = await db.query.CartItem.findMany({
        where: eq(CartItem.cartId, cart.id),
        with: { product: true },
        orderBy: (cartItem, { desc }) => [desc(cartItem.updated_at)],
      });

      // Calculate cart summary
      const summary = {
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cartItems.reduce((sum, item) => {
          const price = item.product?.price ? Number(item.product.price) : 0;
          return sum + price * item.quantity;
        }, 0),
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

  static async removeCartItem(cartItemId:string) {
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