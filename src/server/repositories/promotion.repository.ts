import { db } from "../../lib/db/db";
import { eq, and, lte, gte } from "drizzle-orm";
import { AppPromotion, AppProduct } from "@/lib/db/schema";
import {
  PromotionProduct,
  PromotionCategory,
} from "@/lib/db/tables/product/promotionRelations.table";

export class PromotionRepository {
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
}
