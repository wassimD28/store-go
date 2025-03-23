import { Context } from "hono";
import { CategoryRepository } from "@/server/repositories/category.repository";
import { idSchema } from "../schemas/common.schema";


export class CategoryController {
  static async getAllCategories(c: Context) {
    try {
      // Log the incoming request details
      console.log("=== GET ALL CATEGORIES REQUEST ===");
      console.log("Headers:", JSON.stringify(c.req.header(), null, 2));
      console.log("Request URL:", c.req.url);
      console.log("Query Parameters:", c.req.query());
      console.log("User context:", c.get("user"));
      
      const { storeId } = c.get("user");
      const categories = await CategoryRepository.findAll(storeId);
      return c.json({
        status: "success",
        data: categories,
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
      // ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
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
}