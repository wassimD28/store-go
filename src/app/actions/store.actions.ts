"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Interface to match your form's data structure
interface CreateStoreData {
  userId: string;
  categoryId: string;
  name: string;
  logoUrl?: string;
  appUrl?: string;
}

export async function createStore({
  userId,
  name,
  logoUrl,
  appUrl,
  categoryId,
}: CreateStoreData) {
  try {
    // Insert the new store into the database
    await db.insert(stores).values({
      userId,
      categoryId,
      name,
      logoUrl: logoUrl ?? null,
      appUrl: appUrl ?? null,
    });

    // Revalidate the stores list page
    revalidatePath("/stores");

    // Return successful result
    return { success: true };
  } catch (error) {
    console.error("Failed to create store:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create store",
    };
  }
}
/**
 * Get all stores for a user with their associated categories
 */
export async function getUserStores(userId: string) {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // Using Drizzle's query builder to join stores with their categories
    const userStores = await db.query.stores.findMany({
      where: eq(stores.userId, userId),
      with: {
        category: true
      },
      orderBy: stores.createdAt,
    });

    return { success: true, data: userStores };
  } catch (error) {
    console.error("Failed to retrieve stores:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve stores",
    };
  }
}
