/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { AppPromotion } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Create a new promotion for a store
 */
export const createPromotion = async ({
  storeId,
  userId,
  name,
  description,
  discountType,
  discountValue,
  couponCode,
  minimumPurchase,
  startDate,
  endDate,
  isActive,
  applicableProducts,
  applicableCategories,
}: {
  storeId: string;
  userId: string;
  name: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number | null;
  couponCode: string | null;
  minimumPurchase: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
}): Promise<ActionResponse<typeof AppPromotion.$inferSelect>> => {
  try {
    // Validate inputs
    if (!name || !discountType || !startDate || !endDate) {
      return {
        success: false,
        error: "Missing required fields for creating a promotion",
      };
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return {
        success: false,
        error: "Start date must be before end date",
      };
    }

    // Validate discount value based on type
    if (
      (discountType === "percentage" || discountType === "fixed_amount") &&
      (!discountValue || discountValue <= 0)
    ) {
      return {
        success: false,
        error: `A valid discount value is required for ${discountType} promotions`,
      };
    }

    // Insert new promotion
    const [newPromotion] = await db
      .insert(AppPromotion)
      .values({
        storeId,
        userId,
        name,
        description,
        discountType,
        discountValue: discountValue ? discountValue.toString() : null,
        couponCode,
        minimumPurchase: minimumPurchase.toString(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        applicableProducts: applicableProducts as any,
        applicableCategories: applicableCategories as any,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return {
      success: true,
      data: newPromotion,
    };
  } catch (error) {
    console.error("Error creating promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create promotion",
    };
  }
};

/**
 * Get all promotions for a specific store
 */
export const getPromotionsByStore = async (
  storeId: string,
): Promise<ActionResponse<(typeof AppPromotion.$inferSelect)[]>> => {
  try {
    const promotions = await db.query.AppPromotion.findMany({
      where: eq(AppPromotion.storeId, storeId),
      orderBy: (promotions, { desc }) => [desc(promotions.created_at)],
    });

    return {
      success: true,
      data: promotions,
    };
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch promotions",
    };
  }
};

/**
 * Get a specific promotion by ID
 */
export const getPromotionById = async (
  promotionId: string,
): Promise<ActionResponse<typeof AppPromotion.$inferSelect>> => {
  try {
    const promotion = await db.query.AppPromotion.findFirst({
      where: eq(AppPromotion.id, promotionId),
    });

    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    return {
      success: true,
      data: promotion,
    };
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch promotion",
    };
  }
};

/**
 * Update an existing promotion
 */
export const updatePromotion = async ({
  id,
  name,
  description,
  discountType,
  discountValue,
  couponCode,
  minimumPurchase,
  startDate,
  endDate,
  isActive,
  applicableProducts,
  applicableCategories,
}: {
  id: string;
  name?: string;
  description?: string | null;
  discountType?:
    | "percentage"
    | "fixed_amount"
    | "free_shipping"
    | "buy_x_get_y";
  discountValue?: number | null;
  couponCode?: string | null;
  minimumPurchase?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}): Promise<ActionResponse<typeof AppPromotion.$inferSelect>> => {
  try {
    // Check if promotion exists
    const existingPromotion = await db.query.AppPromotion.findFirst({
      where: eq(AppPromotion.id, id),
    });

    if (!existingPromotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return {
        success: false,
        error: "Start date must be before end date",
      };
    }

    // Create update object with only the fields that are provided
    const updateData: Partial<typeof AppPromotion.$inferInsert> = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined)
      updateData.discountValue = discountValue
        ? discountValue.toString()
        : null;
    if (couponCode !== undefined) updateData.couponCode = couponCode;
    if (minimumPurchase !== undefined)
      updateData.minimumPurchase = minimumPurchase.toString();
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (applicableProducts !== undefined)
      updateData.applicableProducts = applicableProducts as any;
    if (applicableCategories !== undefined)
      updateData.applicableCategories = applicableCategories as any;

    // Update the promotion
    const [updatedPromotion] = await db
      .update(AppPromotion)
      .set(updateData)
      .where(eq(AppPromotion.id, id))
      .returning();

    return {
      success: true,
      data: updatedPromotion,
    };
  } catch (error) {
    console.error("Error updating promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update promotion",
    };
  }
};

/**
 * Delete a promotion
 */
export const deletePromotion = async (
  promotionId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    const [deletedPromotion] = await db
      .delete(AppPromotion)
      .where(eq(AppPromotion.id, promotionId))
      .returning({ id: AppPromotion.id });

    if (!deletedPromotion) {
      return {
        success: false,
        error: "Promotion not found or already deleted",
      };
    }

    return {
      success: true,
      data: { id: deletedPromotion.id },
    };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete promotion",
    };
  }
};

/**
 * Toggle a promotion's active status
 */
export const togglePromotionStatus = async (
  promotionId: string,
): Promise<ActionResponse<typeof AppPromotion.$inferSelect>> => {
  try {
    // First get the current status
    const promotion = await db.query.AppPromotion.findFirst({
      where: eq(AppPromotion.id, promotionId),
    });

    if (!promotion) {
      return {
        success: false,
        error: "Promotion not found",
      };
    }

    // Toggle the status
    const [updatedPromotion] = await db
      .update(AppPromotion)
      .set({
        isActive: !promotion.isActive,
        updated_at: new Date(),
      })
      .where(eq(AppPromotion.id, promotionId))
      .returning();

    return {
      success: true,
      data: updatedPromotion,
    };
  } catch (error) {
    console.error("Error toggling promotion status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle promotion status",
    };
  }
};

/**
 * Get active promotions for a store
 */
export const getActivePromotions = async (
  storeId: string,
): Promise<ActionResponse<(typeof AppPromotion.$inferSelect)[]>> => {
  try {
    const now = new Date();

    const promotions = await db.query.AppPromotion.findMany({
      where: and(
        eq(AppPromotion.storeId, storeId),
        eq(AppPromotion.isActive, true),
        lte(AppPromotion.startDate, now),
        gte(AppPromotion.endDate, now),
      ),
    });

    return {
      success: true,
      data: promotions,
    };
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch active promotions",
    };
  }
};

/**
 * Validate a coupon code and return the associated promotion if valid
 */
export const validateCouponCode = async (
  storeId: string,
  couponCode: string,
): Promise<ActionResponse<typeof AppPromotion.$inferSelect>> => {
  try {
    const now = new Date();

    const promotion = await db.query.AppPromotion.findFirst({
      where: and(
        eq(AppPromotion.storeId, storeId),
        eq(AppPromotion.couponCode, couponCode),
        eq(AppPromotion.isActive, true),
        lte(AppPromotion.startDate, now),
        gte(AppPromotion.endDate, now),
      ),
    });

    if (!promotion) {
      return {
        success: false,
        error: "Invalid or expired coupon code",
      };
    }

    return {
      success: true,
      data: promotion,
    };
  } catch (error) {
    console.error("Error validating coupon code:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to validate coupon code",
    };
  }
};

/**
 * Get applicable promotions for a specific product
 */
export const getProductPromotions = async (
  storeId: string,
  productId: string,
): Promise<ActionResponse<(typeof AppPromotion.$inferSelect)[]>> => {
  try {
    const now = new Date();

    // Get all active promotions for the store
    const allActivePromotions = await db.query.AppPromotion.findMany({
      where: and(
        eq(AppPromotion.storeId, storeId),
        eq(AppPromotion.isActive, true),
        lte(AppPromotion.startDate, now),
        gte(AppPromotion.endDate, now),
      ),
    });

    // Filter to find promotions applicable to this product
    const applicablePromotions = allActivePromotions.filter((promotion) => {
      const productList = (promotion.applicableProducts as string[]) || [];
      const categoryList = (promotion.applicableCategories as string[]) || [];

      // If both lists are empty, promotion applies to all products
      if (productList.length === 0 && categoryList.length === 0) {
        return true;
      }

      // Check if product is directly in the applicable products list
      if (productList.includes(productId)) {
        return true;
      }

      // For category-based promotions, we would need to check if the product's category
      // is in the applicable categories list, but that would require an additional query
      // This is a placeholder for that logic

      return false;
    });

    return {
      success: true,
      data: applicablePromotions,
    };
  } catch (error) {
    console.error("Error fetching product promotions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch product promotions",
    };
  }
};
