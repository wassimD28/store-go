"use server";

import { db } from "@/lib/db/db";
import { AppSubCategory } from "@/lib/db";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { AppSubCategory as IAppSubCategory } from "@/lib/types/interfaces/schema.interface";
import { eq } from "drizzle-orm";

export const createSubCategory = async ({
  name,
  userId,
  storeId,
  parentCategoryId,
  description,
  imageUrl,
}: Omit<IAppSubCategory, "id" | "created_at" | "updated_at">) => {
  try {
    const [newSubCategory] = await db
      .insert(AppSubCategory)
      .values({
        name,
        userId,
        storeId,
        parentCategoryId,
        description,
        imageUrl,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return { success: true, newSubCategory };
  } catch (error) {
    console.error("Error creating sub category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create sub category",
    };
  }
};

export const deleteSubCategory = async (
  subcategoryId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // Check if subcategory exists and delete it
    const [deletedSubCategory] = await db
      .delete(AppSubCategory)
      .where(eq(AppSubCategory.id, subcategoryId))
      .returning({ id: AppSubCategory.id });

    if (!deletedSubCategory) {
      return {
        success: false,
        error: "Subcategory not found",
      };
    }

    return {
      success: true,
      data: { id: deletedSubCategory.id },
    };
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete subcategory",
    };
  }
};

// Add a function to get subcategories for a store
export const getAppSubCategories = async (storeId: string) => {
  try {
    const subcategories = await db.query.AppSubCategory.findMany({
      where: eq(AppSubCategory.storeId, storeId),
    });
    return { success: true, subcategories };
  } catch (error) {
    console.error("Error fetching app subcategories:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve app subcategories",
    };
  }
};
