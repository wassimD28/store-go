import { Context } from "hono";
import { z } from "zod";
import { PromotionRepository } from "@/server/repositories/promotion.repository";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";

// Define the schema for cart items
const cartItemSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().positive(),
  variantId: idSchema.optional(),
  price: z.number().positive().optional(), // Price is optional, we'll fetch it if not provided
});

const checkPromotionsSchema = z.object({
  cartItems: z.array(cartItemSchema),
});

export class CartPromotionController {
  static async checkPromotionsForCart(c: Context) {
    try {
      // Parse request body and validate using Zod
      const body = await c.req.json();
      const validationResult = checkPromotionsSchema.safeParse(body);

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

      const { cartItems } = validationResult.data;
      const { storeId } = c.get("user");

      if (!cartItems || cartItems.length === 0) {
        return c.json(
          {
            status: "success",
            data: {
              applicablePromotions: [],
              message: "No cart items provided",
            },
          },
          200,
        );
      } // Get all product IDs from cart
      const productIds = [...new Set(cartItems.map((item) => item.productId))];

      // Fetch products to get their categories
      const productsResponse = await Promise.all(
        productIds.map((id) => ProductRepository.findById(id, storeId)),
      );

      // Filter out any null/undefined products
      const products = productsResponse.filter(
        (product) => product !== null && product !== undefined,
      );

      // Extract category IDs
      const categoryIds = [
        ...new Set(
          products
            .filter((product) => product && product.categoryId)
            .map((product) => product.categoryId),
        ),
      ];

      // Get all active promotions that apply to these products or categories
      const allPromotions = await PromotionRepository.findAll(storeId);

      // Filter promotions applicable to the cart items
      const applicablePromotions = allPromotions.filter((promotion) => {
        // Check if the promotion applies to any product in the cart
        const hasApplicableProduct = productIds.some(
          (productId) =>
            Array.isArray(promotion.applicableProducts) &&
            promotion.applicableProducts.includes(productId),
        );

        // Check if the promotion applies to any category of products in the cart
        const hasApplicableCategory = categoryIds.some(
          (categoryId) =>
            Array.isArray(promotion.applicableCategories) &&
            promotion.applicableCategories.includes(categoryId),
        );

        return hasApplicableProduct || hasApplicableCategory;
      }); // Calculate promotion benefits and eligibility
      const promotionsWithEligibility = applicablePromotions.map(
        (promotion) => {
          let isEligible = true;
          const requiredActions = [];
          // Check minimum purchase requirement
          const cartTotal = cartItems.reduce((total, item) => {
            // Use the price from cart item if provided, otherwise get from product
            const itemPrice =
              item.price ??
              products.find((p) => p?.id === item.productId)?.price ??
              0;
            // Ensure we're working with numbers for the calculation
            return Number(total) + Number(itemPrice) * Number(item.quantity);
          }, 0);

          if (
            promotion.minimumPurchase &&
            cartTotal < Number(promotion.minimumPurchase)
          ) {
            isEligible = false;
            const amountNeeded = Number(promotion.minimumPurchase) - cartTotal;
            requiredActions.push({
              type: "ADD_MORE_ITEMS",
              message: `Add ${amountNeeded.toFixed(2)} more to your cart to qualify`,
              amountNeeded: parseFloat(amountNeeded.toFixed(2)),
            });
          } // Check buy X get Y eligibility
          if (
            promotion.discountType === "buy_x_get_y" &&
            promotion.buyQuantity
          ) {
            // Find if there are enough of applicable products
            let applicableQuantity = 0;

            cartItems.forEach((item) => {
              // Check if this item's product is applicable for the promotion
              const product = products.find((p) => p?.id === item.productId);
              // First check if product is directly in applicable products list
              const isProductApplicable =
                Array.isArray(promotion.applicableProducts) &&
                promotion.applicableProducts.includes(item.productId);

              // Then check if product category is in applicable categories
              let isCategoryApplicable = false;
              if (
                product?.categoryId &&
                Array.isArray(promotion.applicableCategories)
              ) {
                isCategoryApplicable = promotion.applicableCategories.includes(
                  product.categoryId,
                );
              }

              if (isProductApplicable || isCategoryApplicable) {
                applicableQuantity += item.quantity;
              }
            });

            if (applicableQuantity < promotion.buyQuantity) {
              isEligible = false;
              requiredActions.push({
                type: "ADD_SPECIFIC_ITEMS",
                message: `Add ${promotion.buyQuantity - applicableQuantity} more qualifying items to receive this offer`,
                quantityNeeded: promotion.buyQuantity - applicableQuantity,
              });
            }
          }
          return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            discountType: promotion.discountType,
            discountValue: Number(promotion.discountValue || 0),
            minimumPurchase: promotion.minimumPurchase
              ? Number(promotion.minimumPurchase)
              : null,
            buyQuantity: promotion.buyQuantity || null,
            getQuantity: promotion.getQuantity || null,
            promotionImage: promotion.promotionImage || null,
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            couponCode: promotion.couponCode || null,
            isEligible,
            requiredActions: isEligible ? [] : requiredActions,
          };
        },
      );

      return c.json({
        status: "success",
        data: {
          applicablePromotions: promotionsWithEligibility,
        },
      });
    } catch (error) {
      console.error("Error checking promotions for cart:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to check promotions for cart items",
        },
        500,
      );
    }
  }
}
