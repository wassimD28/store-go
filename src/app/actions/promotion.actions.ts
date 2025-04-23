/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { AppPromotion } from "@/lib/db/tables/product/appPromotion.table";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";
import Pusher from "pusher";
import { createBroadcastNotification } from "./appUsersNotification.actions";
import { AppNotificationType, DiscountType } from "@/lib/types/enums/common.enum";

// Pusher initialization
const pusherServer = (() => {
  try {
    // Check if all required variables are defined
    const appId = process.env.PUSHER_APP_ID!;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const secret = process.env.PUSHER_APP_SECRET!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    if (!appId || !key || !secret || !cluster) {
      console.warn(
        "Pusher environment variables are missing. Real-time notifications will be disabled.",
      );
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
}): Promise<ActionResponse<any>> => {
  try {
    // Insert new promotion
    const [newPromotion] = await db
      .insert(AppPromotion)
      .values({
        userId,
        storeId,
        name,
        description,
        discountType,
        discountValue: discountValue.toString(),
        couponCode,
        minimumPurchase: minimumPurchase.toString(),
        promotionImage,
        startDate: startDate,
        endDate: endDate,
        buyQuantity,
        getQuantity,
        isActive,
        applicableProducts,
        applicableCategories,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // Only send notification if the promotion is active and should start now or soon
    if (newPromotion && isActive && new Date() >= startDate) {
      try {
        // Create a notification record in the database
        await createBroadcastNotification(
          storeId,
          "new_promotion",
          "New promotion available!",
          `${name} - Check out this special offer!`,
          {
            promotionId: newPromotion.id,
            promotionName: name,
            discountType,
            discountValue: discountValue.toString(),
            imageUrl: promotionImage,
          },
        );

        // Trigger Pusher notification
        if (pusherServer) {
          await pusherServer.trigger(
            `store-${storeId}`,
            AppNotificationType.NewPromotion,
            {
              promotionId: newPromotion.id,
              promotionName: name,
              discountType,
              discountValue: discountValue.toString(),
              imageUrl: promotionImage,
              createdAt: new Date().toISOString(),
            },
          );
        }
      } catch (error) {
        console.error("Error sending promotion notification:", error);
        // Continue with the response - don't let notification failure break the API
      }
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

export const getPromotionsByStore = async (storeId: string) => {
  try {
    const promotions = await db
      .select()
      .from(AppPromotion)
      .where(eq(AppPromotion.storeId, storeId));

    return { success: true, promotions };
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve promotions",
    };
  }
};

export const getPromotionById = async (promotionId: string) => {
  try {
    const promotion = await db
      .select()
      .from(AppPromotion)
      .where(eq(AppPromotion.id, promotionId))
      .limit(1);

    if (!promotion || promotion.length === 0) {
      return { success: false, error: "Promotion not found" };
    }

    return { success: true, promotion: promotion[0] };
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve promotion",
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
  applicableProducts,
  applicableCategories,
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
  applicableProducts: string[];
  applicableCategories: string[];
}): Promise<ActionResponse<any>> => {
  try {
    const [updatedPromotion] = await db
      .update(AppPromotion)
      .set({
        name,
        description,
        discountType,
        discountValue: discountValue.toString(),
        couponCode,
        minimumPurchase: minimumPurchase.toString(),
        promotionImage,
        startDate,
        endDate,
        isActive,
        applicableProducts,
        applicableCategories,
        updated_at: new Date(),
      })
      .where(eq(AppPromotion.id, id))
      .returning();

    if (!updatedPromotion) {
      return {
        success: false,
        error: "Promotion not found or you don't have permission to update it",
      };
    }

    return { success: true, data: updatedPromotion };
  } catch (error) {
    console.error("Error updating promotion:", error);
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
    const [deletedPromotion] = await db
      .delete(AppPromotion)
      .where(eq(AppPromotion.id, promotionId))
      .returning({ id: AppPromotion.id });

    if (!deletedPromotion) {
      return {
        success: false,
        error: "Promotion not found",
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
