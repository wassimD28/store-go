"use server";

import { db } from "@/lib/db/db";
import { AppCategory, AppSubCategory } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { AppCategory as IAppCategory } from "@/lib/types/interfaces/schema.interface";
import { eq } from "drizzle-orm";

export const getAppCategories = async (storeId: string) => {
  try {
    const categories = await db.query.AppCategory.findMany({
      where: eq(AppCategory.storeId, storeId),
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching app categories:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve app categories",
    };
  }
};

export const createCategory = async ({
  name,
  userId,
  description,
  storeId,
  imageUrl,
}: Omit < IAppCategory , 'id'| 'created_at'| 'updated_at'>): Promise<ActionResponse<IAppCategory>> => {
  try {
    // Insert new category [[10]]
    const [newCategory] = await db
      .insert(AppCategory)
      .values({
        name,
        userId,
        storeId,
        description,
        imageUrl,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
};


export const deleteCategory = async (
  categoryId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // First, check if there are any subcategories using this category as parent
    const subcategories = await db.query.AppSubCategory.findMany({
      where: eq(AppSubCategory.parentCategoryId, categoryId),
    });

    // If subcategories exist, return an error
    if (subcategories.length > 0) {
      return {
        success: false,
        error: `Cannot delete category because it has ${subcategories.length} subcategories. Please delete the subcategories first.`,
      };
    }

    // If no subcategories, proceed with deletion
    const [deletedCategory] = await db
      .delete(AppCategory)
      .where(eq(AppCategory.id, categoryId))
      .returning({ id: AppCategory.id });

    if (!deletedCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    return {
      success: true,
      data: { id: deletedCategory.id },
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
};
