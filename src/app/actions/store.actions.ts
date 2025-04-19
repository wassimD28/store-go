"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/db";
import { stores } from "@/lib/db";
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
        category: true,
      },
      orderBy: stores.createdAt,
    });

    return { success: true, data: userStores };
  } catch (error) {
    console.error("Failed to retrieve stores:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve stores",
    };
  }
}

/**
 * Get a single store by its ID with its associated category
 * @param storeId - The unique ID of the store to retrieve
 * @returns Object containing success flag and either store data or error message
 */
export async function getStoreById(storeId: string) {
  if (!storeId) {
    return { success: false, error: "Store ID is required" };
  }

  try {
    // Using Drizzle's query builder to find a single store with its category
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
      with: {
        category: true,
      },
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    return { success: true, data: store };
  } catch (error) {
    console.error("Failed to retrieve store:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve store",
    };
  }
}
