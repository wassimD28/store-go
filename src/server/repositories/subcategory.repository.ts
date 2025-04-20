import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import { AppSubCategory, AppProduct } from "@/lib/db/schema";

export class SubcategoryRepository {
  static async findByCategoryId(categoryId: string, storeId: string) {
    try {
      // Find all subcategories that belong to the given category ID and store ID
      return await db.query.AppSubCategory.findMany({
        where: (subcategory) => {
          return (
            eq(subcategory.parentCategoryId, categoryId) &&
            eq(subcategory.storeId, storeId)
          );
        },
      });
    } catch (error) {
      console.error(
        `Error fetching subcategories for category ID ${categoryId}:`,
        error,
      );
      throw new Error(
        `Failed to fetch subcategories for category ID ${categoryId}`,
      );
    }
  }
  static async findAll(storeId: string) {
    try {
      return await db.query.AppSubCategory.findMany({
        where: eq(AppSubCategory.storeId, storeId),
      });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw new Error("Failed to fetch subcategories");
    }
  }

  static async findById(id: string) {
    try {
      return await db.query.AppSubCategory.findFirst({
        where: eq(AppSubCategory.id, id),
      });
    } catch (error) {
      console.error(`Error fetching subcategory with ID ${id}:`, error);
      throw new Error(`Failed to fetch subcategory with ID ${id}`);
    }
  }

  static async findByIdWithProducts(id: string) {
    try {
      // First get the subcategory
      const subcategory = await db.query.AppSubCategory.findFirst({
        where: eq(AppSubCategory.id, id),
      });

      if (!subcategory) return null;

      // Then get all products that belong to this subcategory
      const products = await db.query.AppProduct.findMany({
        where: eq(AppProduct.subcategoryId, id),
      });

      // Return both the subcategory and its products
      return {
        ...subcategory,
        products,
      };
    } catch (error) {
      console.error(
        `Error fetching subcategory with products for ID ${id}:`,
        error,
      );
      throw new Error(`Failed to fetch subcategory with products for ID ${id}`);
    }
  }
}
