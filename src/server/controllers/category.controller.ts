import { Context } from "hono";
import { CategoryRepository, CategoryCreateInput, CategoryUpdateInput } from "@/server/repositories/category.repository";

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
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid category ID"
        }, 400);
      }

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
      const body = await c.req.json();
      
      // Validate required fields
      const requiredFields = ["app_user_id", "name"];
      for (const field of requiredFields) {
        if (!(field in body)) {
          return c.json({
            status: "error",
            message: `Missing required field: ${field}`
          }, 400);
        }
      }

      const categoryData: CategoryCreateInput = {
        app_user_id: body.app_user_id,
        name: body.name,
        description: body.description || "",
        imageUrl: body.imageUrl || ""
      };

      const newCategory = await CategoryRepository.create(categoryData);
      
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
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid category ID"
        }, 400);
      }

      const body = await c.req.json();
      const updateData: CategoryUpdateInput = {};

      // Only include fields that are present in the request
      if ("name" in body) updateData.name = body.name;
      if ("description" in body) updateData.description = body.description;
      if ("imageUrl" in body) updateData.imageUrl = body.imageUrl;

      if (Object.keys(updateData).length === 0) {
        return c.json({
          status: "error",
          message: "No valid fields provided for update"
        }, 400);
      }

      const existingCategory = await CategoryRepository.findById(id);
      if (!existingCategory) {
        return c.json({
          status: "error",
          message: "Category not found"
        }, 404);
      }

      const updatedCategory = await CategoryRepository.update(id, updateData);
      
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
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid category ID"
        }, 400);
      }

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