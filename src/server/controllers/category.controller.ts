import { Context } from "hono";
import { CategoryRepository } from "@/server/repositories/category.repository";
import { idSchema } from "../schemas/common.schema";


export class CategoryController {
  static async getAllCategories(c: Context) {
    try {
      const { storeId } = c.get("user");
      const categories = await CategoryRepository.findAll(storeId);
      return c.json({
        status: "success",
        data: categories,
      });
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch categories",
        },
        500,
      );
    }
  }


  static async getCategoryByIdWithProducts(c: Context) {
    try {
      const categoryId = c.req.param("categoryId");
      // ensure id is valid
      const validId = idSchema.safeParse(categoryId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid category ID",
          },
          400,
        );
      }

      const { storeId } = c.get("user");

      // Use the new repository method to get category with products
      const categoryWithProducts =
        await CategoryRepository.findByIdWithProducts(categoryId);

      if (!categoryWithProducts) {
        return c.json(
          {
            status: "error",
            message: "Category not found",
          },
          404,
        );
      }

      // Verify that the category belongs to the correct store
      if (categoryWithProducts.storeId !== storeId) {
        return c.json(
          {
            status: "error",
            message: "Unauthorized access to this category",
          },
          403,
        );
      }

      return c.json({
        status: "success",
        data: categoryWithProducts,
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch category with products",
        },
        500,
      );
    }
  }

  static async getCategoryById(c: Context) {
    try {
      const id = c.req.param("id");
      // ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid ID",
          },
          400,
        );
      }

      const category = await CategoryRepository.findById(id);
      if (!category) {
        return c.json(
          {
            status: "error",
            message: "Category not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: category,
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch category",
        },
        500,
      );
    }
  }
}