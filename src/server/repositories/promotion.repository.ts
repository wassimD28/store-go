import { db } from "../../lib/db/db";
import { eq, and, lte, gte, or, sql } from "drizzle-orm";
import { AppPromotion, AppProduct } from "@/lib/db/schema";

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

      // Add debugging logs
      console.log(
        "Searching promotions for product:",
        productId,
        "in store:",
        storeId,
      );
      console.log("Product category:", product.categoryId);
      try {
        // Let's try a simpler query first to ensure basic functionality works
        console.log("Attempting simple query before complex one");
        const basicQuery = await db.query.AppPromotion.findMany({
          where: eq(AppPromotion.storeId, storeId),
          limit: 1,
        });

        console.log("Basic query returned:", basicQuery.length, "results");

        // Now try the optimized query
        console.log("Attempting optimized query with array conditions");
        return await db.query.AppPromotion.findMany({
          where: and(
            eq(AppPromotion.storeId, storeId),
            eq(AppPromotion.isActive, true),
            lte(AppPromotion.startDate, now),
            gte(AppPromotion.endDate, now),
            or(
              // Simplify the SQL pattern to diagnose the issue
              sql`${productId}::text = ANY(SELECT jsonb_array_elements_text(COALESCE(${AppPromotion.applicableProducts}::jsonb, '[]'::jsonb)))`,
              sql`${product.categoryId}::text = ANY(SELECT jsonb_array_elements_text(COALESCE(${AppPromotion.applicableCategories}::jsonb, '[]'::jsonb)))`,
            ),
          ),
        });
      } catch (sqlError) {
        // If the optimized query fails, fall back to a simpler approach
        console.warn(
          `Optimized query failed, using fallback approach: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}`,
        );

        try {
          console.log("Attempting fallback query without complex conditions");
          // Get all active promotions for this store
          const allActivePromotions = await db.query.AppPromotion.findMany({
            where: and(
              eq(AppPromotion.storeId, storeId),
              eq(AppPromotion.isActive, true),
              lte(AppPromotion.startDate, now),
              gte(AppPromotion.endDate, now),
            ),
          });

          console.log(
            `Found ${allActivePromotions.length} active promotions for store: ${storeId}`,
          );

          // Debug the structure of the first promotion if available
          if (allActivePromotions.length > 0) {
            const firstPromo = allActivePromotions[0];
            console.log("Sample promotion structure:", {
              id: firstPromo.id,
              applicableProductsType: typeof firstPromo.applicableProducts,
              applicableProductsValue: firstPromo.applicableProducts,
              applicableCategoriesType: typeof firstPromo.applicableCategories,
              applicableCategoriesValue: firstPromo.applicableCategories,
            });
          }

          // Filter in JavaScript for applicable products or categories
          const filteredPromotions = allActivePromotions.filter((promotion) => {
            // Handle different formats of JSON data safely
            let applicableProducts = [];
            let applicableCategories = [];

            try {
              if (promotion.applicableProducts) {
                // Handle both string and array formats
                if (typeof promotion.applicableProducts === "string") {
                  applicableProducts = JSON.parse(promotion.applicableProducts);
                } else if (Array.isArray(promotion.applicableProducts)) {
                  applicableProducts = promotion.applicableProducts;
                }
              }

              if (promotion.applicableCategories) {
                // Handle both string and array formats
                if (typeof promotion.applicableCategories === "string") {
                  applicableCategories = JSON.parse(
                    promotion.applicableCategories,
                  );
                } else if (Array.isArray(promotion.applicableCategories)) {
                  applicableCategories = promotion.applicableCategories;
                }
              }
            } catch (jsonError) {
              console.error("Error parsing promotion arrays:", jsonError);
              return false;
            }

            return (
              applicableProducts.includes(productId) ||
              (product.categoryId &&
                applicableCategories.includes(product.categoryId))
            );
          });

          console.log(
            `Filtered to ${filteredPromotions.length} applicable promotions`,
          );
          return filteredPromotions;
        } catch (fallbackError) {
          console.error(
            `Fallback approach also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
          );
          // Return empty array as last resort
          return [];
        }
      }
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
      });
    } catch (error) {
      console.error(`Error fetching promotion with ID ${id}:`, error);
      throw new Error(`Failed to fetch promotion with ID ${id}`);
    }
  }
}
