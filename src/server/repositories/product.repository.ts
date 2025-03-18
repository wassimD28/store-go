import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppProduct } from "@/lib/db/schema";


export class ProductRepository {
  static async findAll(storeId: string) {
    try {
      return await db.query.AppProduct.findMany({
        where: eq(AppProduct.storeId, storeId),
        with: {
          category: true,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  static async findById(id: string) {
    try {
      return await db.query.AppProduct.findFirst({
        where: eq(AppProduct.id, id),
        with: {
          category: true,
        },
      });
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw new Error(`Failed to fetch product with ID ${id}`);
    }
  }

  static async findByCategory(categoryId: string, storeId: string) {
    try {
      return await db.query.AppProduct.findMany({
        where:
          and(
          eq(AppProduct.categoryId, categoryId),
          eq(AppProduct.storeId, storeId)),
        with: {
          category: true,
        },
      });
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      throw new Error(`Failed to fetch products for category ${categoryId}`);
    }
  }
}
