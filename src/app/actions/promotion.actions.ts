/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Pusher from "pusher";
import { db } from "@/lib/db/db";
import { AppPromotion } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { PromotionWithRelations } from "@/lib/types/interfaces/promotion.interface";
import { eq } from "drizzle-orm";
import {
  AppNotificationType,
  DiscountType,
} from "@/lib/types/enums/common.enum";
import { NOTIFICATION_CHANNELS } from "@/server/constants/channels";
import { PromotionRepository } from "@/server/repositories/promotion.repository";
import { createBroadcastNotification } from "./appUsersNotification.actions";

// Pusher initialization
const pusherServer = (() => {
  try {
    // Check if all required variables are defined
    const appId = process.env.PUSHER_APP_ID!;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const secret = process.env.PUSHER_APP_SECRET!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    if (!appId || !key || !secret || !cluster) {
      console.error("Missing Pusher configuration variables");
      return null;
    }

    return new Pusher({
      appId,
      key,
      secret,
      cluster,
    });
  } catch (error) {
    console.error("Failed to initialize Pusher:", error);
    return null;
  }
})();

export const createPromotion = async ({
  userId,
  storeId,
  name,
  description,
  discountType,
  discountValue,
  couponCode,
  minimumPurchase,
  promotionImage,
  buyQuantity,
  getQuantity,
  startDate,
  endDate,
  isActive,
  applicableProducts,
  applicableCategories,
  sameProductOnly,
  yApplicableProducts,
  yApplicableCategories,
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
  applicableProducts: string[];
  applicableCategories: string[];
  sameProductOnly?: boolean;
  yApplicableProducts?: string[];
  yApplicableCategories?: string[];
}): Promise<ActionResponse<any>> => {
  try {
    // Call the repository method with the appropriate parameters
    const newPromotion = await PromotionRepository.createPromotion({
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
      // Map the arrays to the new parameter names
      productIds: applicableProducts || [],
      categoryIds: applicableCategories || [],
      yProductIds: yApplicableProducts || [],
      yCategoryIds: yApplicableCategories || [],
    }); // Only send notification if the promotion is active and should start now or soon
    if (newPromotion && isActive && new Date() >= startDate) {
      // Create a notification record in the database
      try {
        await createBroadcastNotification(
          storeId,
          "new_promotion",
          "New promotion available!",
          `${name} - ${discountValue}${discountType === "percentage" ? "%" : "$"} off is now available!`,
          {
            promotionId: newPromotion.id,
            promotionName: name,
            discountType,
            discountValue: String(discountValue),
            imageUrl: promotionImage,
            expiresAt: endDate.toISOString(),
          },
        );

        // Trigger real-time Pusher notification
        if (pusherServer) {
          await pusherServer.trigger(
            `store-${storeId}`,
            AppNotificationType.NewPromotion,
            {
              promotionId: newPromotion.id,
              promotionName: name,
              discountType,
              discountValue: String(discountValue),
              imageUrl: promotionImage,
              expiresAt: endDate.toISOString(),
              createdAt: new Date().toISOString(),
            },
          );
        }
      } catch (error) {
        console.error("Error sending promotion notification:", error);
        // Continue with the response - don't let notification failure break the API
      }

      // Also send the existing notification for backward compatibility
      await sendPromotionNotification(storeId, newPromotion);
    }

    return { success: true, data: newPromotion };
  } catch (error) {
    console.error("Error creating promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create promotion",
    };
  }
};

export const getPromotionsByStore = async (
  storeId: string,
): Promise<ActionResponse<PromotionWithRelations[]>> => {
  try {
    // Use the direct query to get promotions, since we need to transform the data for frontend
    const promotions = await db.query.AppPromotion.findMany({
      where: eq(AppPromotion.storeId, storeId),
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
      orderBy: (promotions, { desc }) => [desc(promotions.created_at)],
    });

    // Transform the response to match the format expected by the frontend
    const transformedPromotions = promotions.map((promotion: any) => {
      // Safely handle relation data that might be missing
      const products = promotion.products || [];
      const categories = promotion.categories || [];
      const yProducts = promotion.yProducts || [];
      const yCategories = promotion.yCategories || []; // Get full product and category objects
      const applicableProducts =
        products.length > 0
          ? products.map((p: any) => p.product || { id: p.productId })
          : Array.isArray(promotion.applicableProducts)
            ? promotion.applicableProducts
            : [];

      const applicableCategories =
        categories.length > 0
          ? categories.map((c: any) => c.category || { id: c.categoryId })
          : Array.isArray(promotion.applicableCategories)
            ? promotion.applicableCategories
            : [];

      const yApplicableProducts =
        yProducts.length > 0
          ? yProducts.map((p: any) => p.product || { id: p.productId })
          : Array.isArray(promotion.yApplicableProducts)
            ? promotion.yApplicableProducts
            : [];

      const yApplicableCategories =
        yCategories.length > 0
          ? yCategories.map((c: any) => c.category || { id: c.categoryId })
          : Array.isArray(promotion.yApplicableCategories)
            ? promotion.yApplicableCategories
            : [];

      return {
        ...promotion,
        applicableProducts,
        applicableCategories,
        yApplicableProducts,
        yApplicableCategories,
      } as PromotionWithRelations;
    });

    return { success: true, data: transformedPromotions };
  } catch (error) {
    console.error("Error fetching promotions by store:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch promotions",
    };
  }
};

export const getPromotionById = async (
  promotionId: string,
): Promise<ActionResponse<PromotionWithRelations>> => {
  try {
    // Use the repository to find the promotion
    const promotion: any = await db.query.AppPromotion.findFirst({
      where: eq(AppPromotion.id, promotionId),
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
    if (!promotion) {
      return {
        success: false,
        error: `Promotion with ID ${promotionId} not found`,
      };
    } // Safely handle relation data that might be missing
    const products = promotion.products || [];
    const categories = promotion.categories || [];
    const yProducts = promotion.yProducts || [];
    const yCategories = promotion.yCategories || [];

    // Get full product and category objects
    const applicableProducts =
      products.length > 0
        ? products.map((p: any) => p.product || { id: p.productId })
        : Array.isArray(promotion.applicableProducts)
          ? promotion.applicableProducts
          : [];
    const applicableCategories =
      categories.length > 0
        ? categories.map((c: any) => c.category || { id: c.categoryId })
        : Array.isArray(promotion.applicableCategories)
          ? promotion.applicableCategories
          : [];

    const yApplicableProducts =
      yProducts.length > 0
        ? yProducts.map((p: any) => p.product || { id: p.productId })
        : Array.isArray(promotion.yApplicableProducts)
          ? promotion.yApplicableProducts
          : [];

    const yApplicableCategories =
      yCategories.length > 0
        ? yCategories.map((c: any) => c.category || { id: c.categoryId })
        : Array.isArray(promotion.yApplicableCategories)
          ? promotion.yApplicableCategories
          : [];

    const transformedPromotion: PromotionWithRelations = {
      ...promotion,
      applicableProducts,
      applicableCategories,
      yApplicableProducts,
      yApplicableCategories,
    } as PromotionWithRelations;

    return { success: true, data: transformedPromotion };
  } catch (error) {
    console.error(`Error fetching promotion with ID ${promotionId}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch promotion",
    };
  }
};

export const updatePromotion = async ({
  id,
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
  applicableProducts,
  applicableCategories,
  yApplicableProducts,
  yApplicableCategories,
}: {
  id: string;
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
  applicableProducts: string[];
  applicableCategories: string[];
  yApplicableProducts?: string[];
  yApplicableCategories?: string[];
}): Promise<ActionResponse<any>> => {
  try {
    // Call the repository method with the appropriate parameters
    const updatedPromotion = await PromotionRepository.updatePromotion(id, {
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
      // Map the arrays to the new parameter names
      productIds: applicableProducts || [],
      categoryIds: applicableCategories || [],
      yProductIds: yApplicableProducts || [],
      yCategoryIds: yApplicableCategories || [],
    }); // Send notification if the promotion is being activated or updated while active
    if (updatedPromotion && isActive && new Date() >= startDate) {
      // Create a notification record in the database for the updated promotion
      try {
        await createBroadcastNotification(
          updatedPromotion.storeId,
          "new_promotion",
          "Promotion updated!",
          `${name} - ${discountValue}${discountType === "percentage" ? "%" : "$"} off has been updated!`,
          {
            promotionId: updatedPromotion.id,
            promotionName: name,
            discountType,
            discountValue: String(discountValue),
            imageUrl: promotionImage,
            expiresAt: endDate.toISOString(),
            isUpdate: true,
          },
        );

        // Trigger real-time Pusher notification
        if (pusherServer) {
          await pusherServer.trigger(
            `store-${updatedPromotion.storeId}`,
            AppNotificationType.NewPromotion,
            {
              promotionId: updatedPromotion.id,
              promotionName: name,
              discountType,
              discountValue: String(discountValue),
              imageUrl: promotionImage,
              expiresAt: endDate.toISOString(),
              createdAt: new Date().toISOString(),
              isUpdate: true,
            },
          );
        }
      } catch (error) {
        console.error("Error sending promotion update notification:", error);
        // Continue with the response - don't let notification failure break the API
      }

      // Also send the existing notification for backward compatibility
      await sendPromotionNotification(
        updatedPromotion.storeId,
        updatedPromotion,
      );
    }

    return { success: true, data: updatedPromotion };
  } catch (error) {
    console.error(`Error updating promotion with ID ${id}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update promotion",
    };
  }
};

export const deletePromotion = async (
  promotionId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // Due to cascade delete, this will also delete all related records in conjunction tables
    const [deletedPromotion] = await db
      .delete(AppPromotion)
      .where(eq(AppPromotion.id, promotionId))
      .returning({ id: AppPromotion.id });

    if (!deletedPromotion) {
      return {
        success: false,
        error: `Promotion with ID ${promotionId} not found`,
      };
    }

    return { success: true, data: { id: deletedPromotion.id } };
  } catch (error) {
    console.error(`Error deleting promotion with ID ${promotionId}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete promotion",
    };
  }
};

// Helper function to send promotion notification
async function sendPromotionNotification(storeId: string, promotion: any) {
  if (!pusherServer) {
    console.warn("Pusher not initialized, skipping notification");
    return;
  }

  const channel = `${NOTIFICATION_CHANNELS.STORE}-${storeId}`;

  try {
    // Send with the older event name for backward compatibility
    await pusherServer.trigger(channel, "promotion-activated", {
      message: `New promotion: ${promotion.name}`,
      promotion,
      // Add new consistent fields that match our new_promotion format
      promotionId: promotion.id,
      promotionName: promotion.name,
      discountType: promotion.discountType,
      discountValue: String(promotion.discountValue),
      imageUrl: promotion.promotionImage,
      expiresAt: promotion.endDate,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to send promotion notification:", error);
  }
}
