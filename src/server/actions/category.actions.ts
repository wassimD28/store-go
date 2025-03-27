import { z } from "zod";
import { createCategorySchema } from "../schemas/category.schema";
import { db } from "@/lib/db/db";
import { AppCategory, AppSubCategory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class CategoryActions {
  // Fetch main categories for parent category selection
  static async getMainCategories(storeId: string){
    // Implement database query to fetch only main categories
    return await db
      .select()
      .from(AppCategory)
      .where(eq(AppCategory.storeId, storeId));
  }

  // Create category with image handling
  static async create(values: z.infer<typeof createCategorySchema>, storeId: string, userId:string) {
    try {
      // Validate input
      const validatedData = createCategorySchema.parse(values);

      // Determine which table to insert into based on category type
      const categoryTable = validatedData.isMainCategory
        ? AppCategory
        : AppSubCategory;

      // Prepare insert data
      const insertData = {
        name: validatedData.name,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        userId, // Implement user authentication
        storeId,
        ...(validatedData.isMainCategory
          ? {}
          : { parentCategoryId: validatedData.parentCategory }),
      };

      // Insert category
      const newCategory = await db
        .insert(categoryTable)
        .values(insertData)
        .returning();

      return newCategory[0];
    } catch (error) {
      console.error("Category creation error", error);
      throw new Error("Failed to create category");
    }
  }
}
