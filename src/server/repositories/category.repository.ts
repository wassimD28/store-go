import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import { AppCategory, AppProduct } from "@/lib/db/schema";

export class CategoryRepository {
  static async findAll(storeId: string) {
    try {
      return await db.query.AppCategory.findMany({
        where: eq(AppCategory.storeId, storeId),
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async findById(id: string) {
    try {
      return await db.query.AppCategory.findFirst({
        where: eq(AppCategory.id, id),
      });
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw new Error(`Failed to fetch category with ID ${id}`);
    }
  }

  static async findByIdWithProducts(id: string) {
    try {
      // First get the category
      const category = await db.query.AppCategory.findFirst({
        where: eq(AppCategory.id, id),
      });

      if (!category) return null;

      // Then get all products that belong to this category
      const products = await db.query.AppProduct.findMany({
        where: eq(AppProduct.categoryId, id),
      });

      // Return both the category and its products
      return {
        ...category,
        products,
      };
    } catch (error) {
      console.error(
        `Error fetching category with products for ID ${id}:`,
        error,
      );
      throw new Error(`Failed to fetch category with products for ID ${id}`);
    }
  }
}
