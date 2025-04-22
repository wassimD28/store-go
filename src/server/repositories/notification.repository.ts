/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../../lib/db/db";
import { StoreNotification, storeNotificationTypeEnum } from "@/lib/db/schema";

// Define types for notification data using the actual enum type
type StoreNotificationType = (typeof storeNotificationTypeEnum.enumValues)[number];

interface StoreNotificationData {
  storeId: string;
  type: StoreNotificationType; // Use the enum type instead of string
  title: string;
  content: string;
  data?: Record<string, any>;
}

export class StoreNotificationRepository {
  static async create(
    notificationData: StoreNotificationData,
  ): Promise<typeof StoreNotification.$inferSelect> {
    try {
      // Ensure the type is valid
      if (
        !storeNotificationTypeEnum.enumValues.includes(
          notificationData.type as any,
        )
      ) {
        throw new Error(`Invalid notification type: ${notificationData.type}`);
      }

      const [newNotification] = await db
        .insert(StoreNotification)
        .values({
          storeId: notificationData.storeId,
          type: notificationData.type,
          title: notificationData.title,
          content: notificationData.content,
          data: notificationData.data || {},
        })
        .returning();
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }
}
