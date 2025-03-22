import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import { AppCategory } from "@/lib/db/schema";

export class CategoryRepository {
  static async findAll(storeId: string) {
    try {
      return await db.query.AppCategory.findMany(
        {
          where: eq(AppCategory.storeId, storeId)
        },
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async findById(id: string) {
    try {
      return await db.query.AppCategory.findFirst({
        where: eq(AppCategory.id, id)
      });
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw new Error(`Failed to fetch category with ID ${id}`);
    }
  }
}