"use server";

import { db } from "@/lib/db/db";
import { AppAddress, AppOrder, AppReview, AppWishlist } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq, and, count } from "drizzle-orm";

/**
 * Interface for customer activity summary
 */
interface ActivitySummary {
  ordersCount: number;
  wishlistCount: number;
  reviewsCount: number;
}

/**
 * Fetch a summary of customer activity including orders, wishlist items, and reviews
 * @param userId - The customer's user ID
 * @returns ActionResponse with activity summary counts
 */
export async function getCustomerActivitySummary(
  userId: string,
): Promise<ActionResponse<ActivitySummary>> {
  try {
    // Get count of orders
    const orderCount = await db
      .select({ count: count() })
      .from(AppOrder)
      .where(eq(AppOrder.appUserId, userId));

    // Get count of wishlist items
    const wishlistCount = await db
      .select({ count: count() })
      .from(AppWishlist)
      .where(eq(AppWishlist.appUserId, userId));

    // Get count of reviews
    const reviewCount = await db
      .select({ count: count() })
      .from(AppReview)
      .where(eq(AppReview.appUserId, userId));

    // Compile the activity summary
    const activitySummary: ActivitySummary = {
      ordersCount: orderCount[0]?.count || 0,
      wishlistCount: wishlistCount[0]?.count || 0,
      reviewsCount: reviewCount[0]?.count || 0,
    };

    return {
      success: true,
      data: activitySummary,
    };
  } catch (error) {
    console.error("Error fetching customer activity summary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve customer activity",
    };
  }
}

/**
 * Get customer reviews for display
 * @param userId - The customer's user ID
 * @param storeId - Optional storeId to filter reviews
 * @returns ActionResponse with list of reviews by the customer
 */
export async function getCustomerReviews(
  userId: string,
  storeId?: string,
): Promise<ActionResponse<(typeof AppReview.$inferSelect)[]>> {
  try {
    // Create initial query
    let reviewsQuery = db.query.AppReview.findMany({
      where: eq(AppReview.appUserId, userId),
      orderBy: (reviews, { desc }) => [desc(reviews.created_at)],
    });

    // If storeId is provided, filter by store as well
    if (storeId) {
      reviewsQuery = db.query.AppReview.findMany({
        where: and(
          eq(AppReview.appUserId, userId),
          eq(AppReview.storeId, storeId),
        ),
        orderBy: (reviews, { desc }) => [desc(reviews.created_at)],
      });
    }

    // Execute the query
    const reviews = await reviewsQuery;

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    console.error("Error fetching customer reviews:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve customer reviews",
    };
  }
}
/**
 * Get customer orders with relationship data
 * @param userId - The customer's user ID
 * @returns ActionResponse with list of orders
 */
export async function getCustomerOrders(
  userId: string,
): Promise<ActionResponse<(typeof AppOrder.$inferSelect)[]>> {
  try {
    const orders = await db.query.AppOrder.findMany({
      where: eq(AppOrder.appUserId, userId),
      orderBy: (orders, { desc }) => [desc(orders.order_date)],
      with: {
        address: true,
        // We could expand with additional relations if needed
      },
    });

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve customer orders",
    };
  }
}

export interface ReviewWithUser {
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
}
/**
 * Get customer wishlist items with product details
 * @param userId - The customer's user ID
 * @returns ActionResponse with list of wishlist items including product info
 */
export async function getProductReviews(
  productId: string,
): Promise<ActionResponse<ReviewWithUser[]>> {
  try {
    // Fetch reviews for the specified product with user information
    const reviews = await db.query.AppReview.findMany({
      where: eq(AppReview.productId, productId),
      orderBy: (reviews) => reviews.created_at,
      with: {
        appUser: {
          columns: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Map to ReviewWithUser format
    const formattedReviews: ReviewWithUser[] = reviews.map((review) => ({
      id: review.id,
      storeId: review.storeId,
      appUserId: review.appUserId,
      productId: review.productId,
      rating: review.rating,
      content: review.content,
      created_at: review.created_at,
      updated_at: review.updated_at,
      appUser: {
        name: review.appUser.name,
        avatar: review.appUser.avatar,
      },
    }));

    return {
      success: true,
      data: formattedReviews,
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}

/**
 * Get customer addresses
 * @param userId - The customer's user ID
 * @returns ActionResponse with list of addresses
 */
export async function getCustomerAddresses(
  userId: string,
): Promise<ActionResponse<(typeof AppAddress.$inferSelect)[]>> {
  try {
    const addresses = await db.query.AppAddress.findMany({
      where: eq(AppAddress.appUserId, userId),
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve customer addresses",
    };
  }
}

// Define interface for wishlist item with product details
export interface WishlistItem {
  id: string;
  storeId: string;
  appUserId: string;
  product_id: string;
  added_at: Date;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    image_urls: string[];
  };
}

/**
 * Get customer wishlist items with product details
 * @param userId - The customer's user ID
 * @param storeId - Optional storeId to filter wishlist items
 * @returns ActionResponse with list of wishlist items including product info
 */
export async function getCustomerWishlist(
  userId: string,
  storeId?: string,
): Promise<ActionResponse<WishlistItem[]>> {
  try {
    let query;

    if (storeId) {
      query = db.query.AppWishlist.findMany({
        where: and(
          eq(AppWishlist.appUserId, userId),
          eq(AppWishlist.storeId, storeId),
        ),
        with: {
          product: true,
        },
        orderBy: (items, { desc }) => [desc(items.added_at)],
      });
    } else {
      query = db.query.AppWishlist.findMany({
        where: eq(AppWishlist.appUserId, userId),
        with: {
          product: true,
        },
        orderBy: (items, { desc }) => [desc(items.added_at)],
      });
    }

    const wishlistResults = await query;

    // Map the results to ensure proper typing
    const wishlist: WishlistItem[] = wishlistResults.map((item) => ({
      id: item.id,
      storeId: item.storeId,
      appUserId: item.appUserId,
      product_id: item.product_id,
      added_at: item.added_at,
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: String(item.product.price), // Ensure price is a string
        image_urls: Array.isArray(item.product.image_urls)
          ? (item.product.image_urls as string[])
          : [], // Convert to string[] or use empty array as fallback
      },
    }));

    return {
      success: true,
      data: wishlist,
    };
  } catch (error) {
    console.error("Error fetching customer wishlist:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve customer wishlist",
    };
  }
}