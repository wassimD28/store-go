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
      
      if (!product) return [];
      
      const now = new Date();
      
      // Find promotions that are active and apply to this product or its category
      return await db.query.AppPromotion.findMany({
        where: and(
          eq(AppPromotion.storeId, storeId),
          eq(AppPromotion.isActive, true),
          lte(AppPromotion.startDate, now),
          gte(AppPromotion.endDate, now),
          or(
            sql`${productId}::uuid = ANY(${AppPromotion.applicableProducts})`,
            sql`${product.categoryId}::uuid = ANY(${AppPromotion.applicableCategories})`
          )
        ),
      });
    } catch (error) {
      console.error(`Error fetching promotions for product ${productId}:`, error);
      throw new Error(`Failed to fetch promotions for product ${productId}`);
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
