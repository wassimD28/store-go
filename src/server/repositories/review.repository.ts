import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppReview, AppProduct } from "@/lib/db";

// Define types for review data
interface ReviewData {
  storeId: string;
  appUserId: string;
  productId: string;
  rating: number;
  content: string | null;
}

interface ReviewUpdateData {
  rating?: number;
  content?: string;
}

export class ReviewRepository {
  static async findByProductId(
    productId: string,
    storeId: string,
  ): Promise<(typeof AppReview.$inferSelect)[]> {
    try {
      return await db.query.AppReview.findMany({
        where: and(
          eq(AppReview.productId, productId),
          eq(AppReview.storeId, storeId),
        ),
        with: {
          appUser: true,
        },
        orderBy: (review) => review.created_at,
      });
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw new Error(`Failed to fetch reviews for product ${productId}`);
    }
  }

  static async findById(
    reviewId: string,
  ): Promise<typeof AppReview.$inferSelect | null> {
    try {
      const result = await db.query.AppReview.findFirst({
        where: eq(AppReview.id, reviewId),
        with: {
          appUser: true,
          product: true,
        },
      });
      return result ?? null; // Convert undefined to null
    } catch (error) {
      console.error(`Error fetching review ${reviewId}:`, error);
      throw new Error(`Failed to fetch review ${reviewId}`);
    }
  }

  static async findByUserAndProduct(
    appUserId: string,
    productId: string,
  ): Promise<typeof AppReview.$inferSelect | null> {
    try {
      const result = await db.query.AppReview.findFirst({
        where: and(
          eq(AppReview.appUserId, appUserId),
          eq(AppReview.productId, productId),
        ),
      });
      return result ?? null; // Convert undefined to null
    } catch (error) {
      console.error(
        `Error finding review for user ${appUserId} and product ${productId}:`,
        error,
      );
      throw new Error(
        `Failed to find review for user ${appUserId} and product ${productId}`,
      );
    }
  }

  static async checkProductExists(
    productId: string,
    storeId: string,
  ): Promise<typeof AppProduct.$inferSelect | null> {
    try {
      const result = await db.query.AppProduct.findFirst({
        where: and(
          eq(AppProduct.id, productId),
          eq(AppProduct.storeId, storeId),
        ),
      });
      return result ?? null; // Convert undefined to null
    } catch (error) {
      console.error(`Error checking if product ${productId} exists:`, error);
      throw new Error(`Failed to check if product ${productId} exists`);
    }
  }

  static async create(
    reviewData: ReviewData,
  ): Promise<typeof AppReview.$inferSelect> {
    try {
      const [newReview] = await db
        .insert(AppReview)
        .values(reviewData)
        .returning();
      return newReview;
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  static async update(
    reviewId: string,
    data: ReviewUpdateData,
  ): Promise<typeof AppReview.$inferSelect> {
    try {
      const [updatedReview] = await db
        .update(AppReview)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(AppReview.id, reviewId))
        .returning();
      return updatedReview;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw new Error(`Failed to update review ${reviewId}`);
    }
  }

  static async delete(reviewId: string): Promise<boolean> {
    try {
      await db.delete(AppReview).where(eq(AppReview.id, reviewId));
      return true;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw new Error(`Failed to delete review ${reviewId}`);
    }
  }
}
