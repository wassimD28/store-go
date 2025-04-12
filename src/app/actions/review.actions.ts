"use server";

import { db } from "@/lib/db/db";
import { AppReview, AppUser } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";

// Updated type definition with all necessary fields
export type ReviewWithUser = {
  id: string;
  storeId: string; 
  appUserId: string;
  productId: string;
  rating: number;
  content: string | null; 
  created_at: Date;
  updated_at: Date;
  appUser: {
    name: string;
    avatar: string | null;
  };
};

export async function getProductReviews(
  productId: string,
): Promise<ActionResponse<ReviewWithUser[]>> {
  try {
    // Fetch reviews for the specified product with user information
    const reviews = await db
      .select({
        id: AppReview.id,
        storeId: AppReview.storeId, // Include storeId in the selection
        appUserId: AppReview.appUserId,
        productId: AppReview.productId,
        rating: AppReview.rating,
        content: AppReview.content,
        created_at: AppReview.created_at,
        updated_at: AppReview.updated_at,
        // Join with AppUser to get user info
        appUser: {
          name: AppUser.name,
          avatar: AppUser.avatar,
        },
      })
      .from(AppReview)
      .leftJoin(AppUser, eq(AppReview.appUserId, AppUser.id))
      .where(eq(AppReview.productId, productId))
      .orderBy(AppReview.created_at);

    return {
      success: true,
      data: reviews as ReviewWithUser[], // Type assertion to ensure correct type
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}

// Optional: Add functionality to create a new review
export async function createProductReview(
  productId: string,
  storeId: string,
  appUserId: string,
  rating: number,
  content: string,
): Promise<ActionResponse<typeof AppReview.$inferSelect>> {
  try {
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    const [newReview] = await db
      .insert(AppReview)
      .values({
        productId,
        storeId,
        appUserId,
        rating,
        content,
      })
      .returning();

    return {
      success: true,
      data: newReview,
    };
  } catch (error) {
    console.error("Error creating product review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}
