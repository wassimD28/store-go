import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import * as schema from "../../lib/db/schema";

export interface CategoryCreateInput {
  app_user_id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export class CategoryRepository {
  static async findAll() {
    try {
      return await db.query.AppCategory.findMany();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async findById(id: number) {
    try {
      return await db.query.AppCategory.findFirst({
        where: eq(schema.AppCategory.id, id)
      });
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw new Error(`Failed to fetch category with ID ${id}`);
    }
  }

  static async create(data: CategoryCreateInput) {
    try {
      const result = await db.insert(schema.AppCategory).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  static async update(id: number, data: CategoryUpdateInput) {
    try {
      const result = await db
        .update(schema.AppCategory)
        .set({ ...data, updated_at: new Date() })
        .where(eq(schema.AppCategory.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw new Error(`Failed to update category with ID ${id}`);
    }
  }

  static async delete(id: number) {
    try {
      return await db
        .delete(schema.AppCategory)
        .where(eq(schema.AppCategory.id, id))
        .returning();
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw new Error(`Failed to delete category with ID ${id}`);
    }
  }
}