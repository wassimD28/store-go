"use server";

import { db } from "@/lib/db/db";
import { storeCategory } from "@/lib/db";

export async function getStoreCategories() {
  try {
    const categories = await db
      .select({
        id: storeCategory.id,
        name: storeCategory.name,
        description: storeCategory.description,
        imageUrl: storeCategory.imageUrl,
      })
      .from(storeCategory);

    return {
      success: true,
      categories,
    };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}
