import { Context } from "hono";
import { CategoryRepository } from "@/server/repositories/category.repository";
import { createCategorySchema, updateCategorySchema } from "../schemas/catecory.schema";

export class CategoryController {
  static async getAllCategories(c: Context) {
    try {
      const categories = await CategoryRepository.findAll();
      return c.json({
        status: "success",
        data: categories
      });
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch categories"
      }, 500);
    }
  }

  static async getCategoryById(c: Context) {
    try {
      const id = c.req.param("id")

      const category = await CategoryRepository.findById(id);
      if (!category) {
        return c.json({
          status: "error",
          message: "Category not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: category
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch category"
      }, 500);
    }
  }

  static async createCategory(c: Context) {
    try {
      const body = c.req.json()
       // Validate the body using Zod
      const validatedData = createCategorySchema.safeParse(body);
      
      if (!validatedData.success) {
        return c.json({
          status: "error",
          message: "Validation failed",
          errors: validatedData.error.format()
        }, 400);
      }

      const newCategory = await CategoryRepository.create(validatedData.data);
      
      return c.json({
        status: "success",
        message: "Category created successfully",
        data: newCategory
      }, 201);
    } catch (error) {
      console.error("Error in createCategory:", error);
      return c.json({
        status: "error",
        message: "Failed to create category"
      }, 500);
    }
  }

  static async updateCategory(c: Context) {
    try {
      const id = c.req.param("id")

      const validatedData = updateCategorySchema.safeParse(c.req.json());
      if (!validatedData.success) {
        return c.json({
          status: "error",
          message: "Validation failed",
          errors: validatedData.error.format()
        }, 400);
      }

      const existingCategory = await CategoryRepository.findById(id);
      if (!existingCategory) {
        return c.json({
          status: "error",
          message: "Category not found"
        }, 404);
      }

      const updatedCategory = await CategoryRepository.update(id, validatedData.data);
      
      return c.json({
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory
      });
    } catch (error) {
      console.error("Error in updateCategory:", error);
      return c.json({
        status: "error",
        message: "Failed to update category"
      }, 500);
    }
  }

  static async deleteCategory(c: Context) {
    try {
      const id = c.req.param("id")

      const existingCategory = await CategoryRepository.findById(id);
      if (!existingCategory) {
        return c.json({
          status: "error",
          message: "Category not found"
        }, 404);
      }

      await CategoryRepository.delete(id);
      
      return c.json({
        status: "success",
        message: "Category deleted successfully"
      });
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      return c.json({
        status: "error",
        message: "Failed to delete category"
      }, 500);
    }
  }
}