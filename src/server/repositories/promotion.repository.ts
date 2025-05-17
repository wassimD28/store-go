import { db } from "../../lib/db/db";
import { eq, and, lte, gte } from "drizzle-orm";
import { AppPromotion, AppProduct } from "@/lib/db/schema";
import {
  PromotionProduct,
  PromotionCategory,
  PromotionYProduct,
  PromotionYCategory,
} from "@/lib/db/tables/product/promotionRelations.table";
import { DiscountType } from "@/lib/types/enums/common.enum";

export class PromotionRepository {
  // Create a new promotion with related junction tables
  static async createPromotion({
    userId,
    storeId,
    name,
    description,
    discountType,
    discountValue,
    couponCode,
    minimumPurchase,
    promotionImage,
    startDate,
    endDate,
    isActive,
    buyQuantity,
    getQuantity,
    sameProductOnly,
    productIds,
    categoryIds,
    yProductIds,
    yCategoryIds,
  }: {
    userId: string;
    storeId: string;
    name: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
    couponCode: string | null;
    minimumPurchase: number;
    promotionImage: string | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    buyQuantity?: number;
    getQuantity?: number;
    sameProductOnly?: boolean;
    productIds: string[];
    categoryIds: string[];
    yProductIds?: string[];
    yCategoryIds?: string[];
  }) {
    try {
      // Create the promotion record
      const [promotion] = await db
        .insert(AppPromotion)
        .values({
          userId,
          storeId,
          name,
          description,
          discountType,
          discountValue: discountValue.toString(), // Convert to string for decimal type
          couponCode,
          minimumPurchase: minimumPurchase.toString(), // Convert to string for decimal type
          promotionImage,
          startDate,
          endDate,
          isActive,
          buyQuantity,
          getQuantity,
          sameProductOnly,
        })
        .returning();

      if (!promotion) {
        throw new Error("Failed to create promotion record");
      }

      // Create promotion-product relations
      if (productIds.length > 0) {
        await db.insert(PromotionProduct).values(
          productIds.map((productId) => ({
            promotionId: promotion.id,
            productId,
          })),
        );
      }

      // Create promotion-category relations
      if (categoryIds.length > 0) {
        await db.insert(PromotionCategory).values(
          categoryIds.map((categoryId) => ({
            promotionId: promotion.id,
            categoryId,
          })),
        );
      }

      // Create Y-product relations for Buy X Get Y promotions
      if (
        discountType === "buy_x_get_y" &&
        yProductIds &&
        yProductIds.length > 0
      ) {
        await db.insert(PromotionYProduct).values(
          yProductIds.map((productId) => ({
            promotionId: promotion.id,
            productId,
          })),
        );
      }

      // Create Y-category relations for Buy X Get Y promotions
      if (
        discountType === "buy_x_get_y" &&
        yCategoryIds &&
        yCategoryIds.length > 0
      ) {
        await db.insert(PromotionYCategory).values(
          yCategoryIds.map((categoryId) => ({
            promotionId: promotion.id,
            categoryId,
          })),
        );
      }

      // Return the created promotion with relations
      return await this.findById(promotion.id, storeId);
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create promotion",
      );
    }
  }

  static async findAll(storeId: string) {
    try {
      const now = new Date();
      return await db.query.AppPromotion.findMany({
        where: and(
          eq(AppPromotion.storeId, storeId),
          eq(AppPromotion.isActive, true),
          lte(AppPromotion.startDate, now),
          gte(AppPromotion.endDate, now),
        ),
        with: {
          products: {
            with: {
              product: true,
            },
          },
          categories: {
            with: {
              category: true,
            },
          },
          yProducts: {
            with: {
              product: true,
            },
          },
          yCategories: {
            with: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw new Error("Failed to fetch promotions");
    }
  }

  static async findByProductId(productId: string, storeId: string) {
    try {
      // First get the product to access its category
      const product = await db.query.AppProduct.findFirst({
        where: eq(AppProduct.id, productId),
        columns: {
          id: true,
          categoryId: true,
        },
      });

      if (!product) {
        console.log(`No product found with ID: ${productId}`);
        return [];
      }

      const now = new Date();

      // Cleaner query using the conjunction tables
      const promotions = await db.query.AppPromotion.findMany({
        where: and(
          eq(AppPromotion.storeId, storeId),
          eq(AppPromotion.isActive, true),
          lte(AppPromotion.startDate, now),
          gte(AppPromotion.endDate, now),
        ),
        with: {
          products: {
            where: eq(PromotionProduct.productId, productId),
          },
          categories: product.categoryId
            ? {
                where: eq(PromotionCategory.categoryId, product.categoryId),
              }
            : undefined,
        },
      });

      // Filter for promotions that match either product or category
      return promotions.filter(
        (p) =>
          p.products.length > 0 || (p.categories && p.categories.length > 0),
      );
    } catch (error) {
      // Log detailed error information
      console.error(
        `Error fetching promotions for product ${productId}:`,
        error,
      );
      console.error("Error details:", {
        productId,
        storeId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // Don't throw - return empty array instead for more robust API behavior
      console.warn(
        `Returning empty promotions array instead of throwing for product ${productId}`,
      );
      return [];
    }
  }
  static async findById(id: string, storeId: string) {
    try {
      const now = new Date();
      return await db.query.AppPromotion.findFirst({
        where: and(
          eq(AppPromotion.id, id),
          eq(AppPromotion.storeId, storeId),
          eq(AppPromotion.isActive, true),
          lte(AppPromotion.startDate, now),
          gte(AppPromotion.endDate, now),
        ),
        with: {
          products: {
            with: {
              product: true,
            },
          },
          categories: {
            with: {
              category: true,
            },
          },
          yProducts: {
            with: {
              product: true,
            },
          },
          yCategories: {
            with: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error fetching promotion with ID ${id}:`, error);
      throw new Error(`Failed to fetch promotion with ID ${id}`);
    }
  }

  // Update an existing promotion and its related junction tables
  static async updatePromotion(
    id: string,
    {
      name,
      description,
      discountType,
      discountValue,
      couponCode,
      minimumPurchase,
      promotionImage,
      startDate,
      endDate,
      isActive,
      buyQuantity,
      getQuantity,
      sameProductOnly,
      productIds,
      categoryIds,
      yProductIds,
      yCategoryIds,
    }: {
      name: string;
      description: string | null;
      discountType: DiscountType;
      discountValue: number;
      couponCode: string | null;
      minimumPurchase: number;
      promotionImage: string | null;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      buyQuantity?: number;
      getQuantity?: number;
      sameProductOnly?: boolean;
      productIds: string[];
      categoryIds: string[];
      yProductIds?: string[];
      yCategoryIds?: string[];
    },
  ) {
    try {
      // First, fetch the promotion to ensure it exists and get its storeId
      const existingPromotion = await db.query.AppPromotion.findFirst({
        where: eq(AppPromotion.id, id),
      });

      if (!existingPromotion) {
        throw new Error(`Promotion with ID ${id} not found`);
      }
      const storeId = existingPromotion.storeId; // Update the promotion record
      const [updatedPromotion] = await db
        .update(AppPromotion)
        .set({
          name,
          description,
          discountType,
          discountValue: discountValue.toString(), // Convert to string for decimal type
          couponCode,
          minimumPurchase: minimumPurchase.toString(), // Convert to string for decimal type
          promotionImage,
          startDate,
          endDate,
          isActive,
          buyQuantity,
          getQuantity,
          sameProductOnly,
        })
        .where(eq(AppPromotion.id, id))
        .returning();

      if (!updatedPromotion) {
        throw new Error(`Failed to update promotion with ID ${id}`);
      }

      // Delete existing relations first
      await db
        .delete(PromotionProduct)
        .where(eq(PromotionProduct.promotionId, id));
      await db
        .delete(PromotionCategory)
        .where(eq(PromotionCategory.promotionId, id));
      await db
        .delete(PromotionYProduct)
        .where(eq(PromotionYProduct.promotionId, id));
      await db
        .delete(PromotionYCategory)
        .where(eq(PromotionYCategory.promotionId, id));

      // Re-create promotion-product relations
      if (productIds.length > 0) {
        await db.insert(PromotionProduct).values(
          productIds.map((productId) => ({
            promotionId: id,
            productId,
          })),
        );
      }

      // Re-create promotion-category relations
      if (categoryIds.length > 0) {
        await db.insert(PromotionCategory).values(
          categoryIds.map((categoryId) => ({
            promotionId: id,
            categoryId,
          })),
        );
      }

      // Re-create Y-product relations for Buy X Get Y promotions
      if (
        discountType === "buy_x_get_y" &&
        yProductIds &&
        yProductIds.length > 0
      ) {
        await db.insert(PromotionYProduct).values(
          yProductIds.map((productId) => ({
            promotionId: id,
            productId,
          })),
        );
      }

      // Re-create Y-category relations for Buy X Get Y promotions
      if (
        discountType === "buy_x_get_y" &&
        yCategoryIds &&
        yCategoryIds.length > 0
      ) {
        await db.insert(PromotionYCategory).values(
          yCategoryIds.map((categoryId) => ({
            promotionId: id,
            categoryId,
          })),
        );
      }

      // Return the updated promotion with relations
      return await this.findById(id, storeId);
    } catch (error) {
      console.error(`Error updating promotion with ID ${id}:`, error);
      throw new Error(
        error instanceof Error
          ? error.message
          : `Failed to update promotion with ID ${id}`,
      );
    }
  }
}
