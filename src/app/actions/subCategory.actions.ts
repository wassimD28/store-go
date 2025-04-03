"use server"

import { db } from "@/lib/db/db";
import { AppSubCategory } from "@/lib/db/schema";
import { AppSubCategory as IAppSubCategory } from "@/lib/types/interfaces/schema.interface";

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