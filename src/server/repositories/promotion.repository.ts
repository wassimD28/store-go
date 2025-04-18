import { db } from "../../lib/db/db";
import { eq, and, lte, gte } from "drizzle-orm";
import { AppPromotion } from "@/lib/db/schema";

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
