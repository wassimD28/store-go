import { Context } from "hono";
import { z } from "zod";
import { PromotionRepository } from "@/server/repositories/promotion.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { db } from "@/lib/db/db";
import { AppPromotion } from "@/lib/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

// Define interfaces for the promotion relation objects
interface PromotionRelation {
  id: string;
  promotionId: string;
  created_at: Date;
}

interface PromotionProductRelation extends PromotionRelation {
  productId: string;
}

interface PromotionCategoryRelation extends PromotionRelation {
  categoryId: string;
}

// Define type for cart items
interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
  price: number;
  discountAmount?: number;
}

// Define the schema for cart items and checkout data
const cartItemSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().positive(),
  variantId: idSchema.optional(),
  price: z.number().positive(),
});

const applyPromotionSchema = z.object({
  cartItems: z.array(cartItemSchema),
  promotionId: idSchema.optional(),
  couponCode: z.string().optional(),
});

// No specific Product interface needed, using the existing product type from the repository

export class CheckoutPromotionController {
  static async applyPromotion(c: Context) {
    try {
      // Parse request body and validate using Zod
      const body = await c.req.json();
      const validationResult = applyPromotionSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request data",
            errors: validationResult.error.format(),
          },
          400,
        );
      }

      const { cartItems, promotionId, couponCode } = validationResult.data;
      const { storeId } = c.get("user") as { storeId: string };

      if (!cartItems || cartItems.length === 0) {
        return c.json(
          {
            status: "error",
            message: "No cart items provided",
          },
          400,
        );
      }

      if (!promotionId && !couponCode) {
        return c.json(
          {
            status: "error",
            message: "Either promotionId or couponCode must be provided",
          },
          400,
        );
      }

      // Find the promotion based on ID or coupon code
      let promotion;

      if (promotionId) {
        promotion = await PromotionRepository.findById(promotionId, storeId);
      } else if (couponCode) {
        const now = new Date();
        promotion = await db.query.AppPromotion.findFirst({
          where: and(
            eq(AppPromotion.couponCode, couponCode),
            eq(AppPromotion.storeId, storeId),
            eq(AppPromotion.isActive, true),
            lte(AppPromotion.startDate, now),
            gte(AppPromotion.endDate, now),
          ),
          with: {
            products: true,
            categories: true,
            yProducts: true,
            yCategories: true,
          },
        });
      }

      if (!promotion) {
        return c.json(
          {
            status: "error",
            message: "Promotion not found or expired",
          },
          404,
        );
      }

      // Calculate cart subtotal before any discounts
      const subtotal = cartItems.reduce(
        (total: number, item: CartItem) => total + item.price * item.quantity,
        0,
      );

      // Check if minimum purchase requirement is met
      if (
        promotion.minimumPurchase &&
        subtotal < Number(promotion.minimumPurchase)
      ) {
        return c.json(
          {
            status: "error",
            message: `This promotion requires a minimum purchase of ${promotion.minimumPurchase}`,
            data: {
              minimumPurchase: Number(promotion.minimumPurchase),
              currentSubtotal: subtotal,
              amountNeeded: Number(promotion.minimumPurchase) - subtotal,
            },
          },
          400,
        );
      }

      // Get product details for category-based eligibility checks
      const productIds = [
        ...new Set(cartItems.map((item: CartItem) => item.productId)),
      ];
      const products = await Promise.all(
        productIds.map((id: string) => ProductRepository.findById(id, storeId)),
      );

      // Check if the promotion applies to the items in the cart using conjunction tables
      const hasEligibleProducts = productIds.some((id: string) =>
        promotion.products?.some(
          (item: PromotionProductRelation) => item.productId === id,
        ),
      );

      const categoryIds = [
        ...new Set(
          products
            .filter(
              (product): product is NonNullable<typeof product> =>
                product !== null &&
                product !== undefined &&
                !!product.categoryId,
            )
            .map((product) => product.categoryId),
        ),
      ];

      const hasEligibleCategories = categoryIds.some((categoryId: string) =>
        promotion.categories?.some(
          (item: PromotionCategoryRelation) => item.categoryId === categoryId,
        ),
      );

      if (!hasEligibleProducts && !hasEligibleCategories) {
        return c.json(
          {
            status: "error",
            message: "This promotion does not apply to the items in your cart",
          },
          400,
        );
      }

      // Calculate discount based on discount type
      let discount = 0;
      let discountedItems: CartItem[] = [];

      switch (promotion.discountType) {
        case "percentage":
          discount = subtotal * (Number(promotion.discountValue) / 100);
          discountedItems = cartItems.map((item: CartItem) => ({
            ...item,
            discountAmount:
              item.price *
              item.quantity *
              (Number(promotion.discountValue) / 100),
          }));
          break;

        case "fixed_amount":
          discount = Number(promotion.discountValue);

          // Distribute fixed discount proportionally based on item prices
          const totalValue = cartItems.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0,
          );
          discountedItems = cartItems.map((item: CartItem) => {
            const itemTotal = item.price * item.quantity;
            const proportion = itemTotal / totalValue;
            return {
              ...item,
              discountAmount: discount * proportion,
            };
          });
          break;

        case "free_shipping":
          // Here we would implement shipping cost calculation and set it to zero
          // For now, we'll set discount to 0 since shipping is handled separately
          discount = 0;
          discountedItems = cartItems.map((item: CartItem) => ({
            ...item,
            discountAmount: 0,
          }));
          break;

        case "buy_x_get_y":
          // Find eligible sets of items for buy X get Y
          if (!promotion.buyQuantity || !promotion.getQuantity) {
            return c.json(
              {
                status: "error",
                message: "Invalid promotion configuration",
              },
              500,
            );
          } // Group items by applicable products/categories using conjunction tables
          const eligibleItems = cartItems.filter((item: CartItem) => {
            const product = products.find((p) => p?.id === item.productId);
            const isProductApplicable = promotion.products?.some(
              (p: PromotionProductRelation) => p.productId === item.productId,
            );
            const isCategoryApplicable =
              product?.categoryId &&
              promotion.categories?.some(
                (c: PromotionCategoryRelation) =>
                  c.categoryId === product.categoryId,
              );

            return isProductApplicable || isCategoryApplicable;
          });

          // Sort by price (ascending) to maximize discount by discounting cheaper items
          const sortedItems = [...eligibleItems].sort(
            (a: CartItem, b: CartItem) => a.price - b.price,
          );
          const totalEligibleQuantity = sortedItems.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0,
          );
          const discountableSets = Math.floor(
            totalEligibleQuantity /
              (Number(promotion.buyQuantity) + Number(promotion.getQuantity)),
          );
          const totalDiscountQuantity =
            discountableSets * Number(promotion.getQuantity);

          // Apply discount to the cheapest items first
          let remainingDiscountQuantity = totalDiscountQuantity;
          discountedItems = cartItems.map((cartItem: CartItem) => {
            // Skip if this item is not in the sorted list (not eligible)
            if (
              !sortedItems.some(
                (item: CartItem) => item.productId === cartItem.productId,
              )
            ) {
              return { ...cartItem, discountAmount: 0 };
            }

            let itemDiscount = 0;
            if (remainingDiscountQuantity > 0) {
              // How many units of this item can be discounted
              const discountableQty = Math.min(
                cartItem.quantity,
                remainingDiscountQuantity,
              );
              itemDiscount = discountableQty * cartItem.price;
              remainingDiscountQuantity -= discountableQty;
            }

            return {
              ...cartItem,
              discountAmount: itemDiscount,
            };
          });

          discount = discountedItems.reduce(
            (sum: number, item: CartItem) => sum + (item.discountAmount || 0),
            0,
          );
          break;

        default:
          return c.json(
            {
              status: "error",
              message: "Unsupported promotion type",
            },
            400,
          );
      }

      // Update usage count for the promotion
      await db
        .update(AppPromotion)
        .set({
          usageCount: (promotion.usageCount || 0) + 1,
        })
        .where(eq(AppPromotion.id, promotion.id));

      // Calculate final price
      const finalTotal = Math.max(0, subtotal - discount);

      return c.json({
        status: "success",
        data: {
          promotion,
          originalSubtotal: subtotal,
          discount,
          finalTotal,
          discountedItems,
          message: `${promotion.name} applied successfully!`,
        },
      });
    } catch (error) {
      console.error("Error applying promotion at checkout:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to apply promotion",
        },
        500,
      );
    }
  }
}
