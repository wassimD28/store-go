import { Context } from "hono";
import { SubcategoryRepository } from "@/server/repositories/subcategory.repository";
import { idSchema } from "../schemas/common.schema";

export class SubcategoryController {
  static async getAllSubcategories(c: Context) {
    try {
      const { storeId } = c.get("user");
      const subcategories = await SubcategoryRepository.findAll(storeId);
      return c.json({
        status: "success",
        data: subcategories,
      });
    } catch (error) {
      console.error("Error in getAllSubcategories:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch subcategories",
        },
        500,
      );
    }
  }

  static async getSubcategoryByIdWithProducts(c: Context) {
    try {
      const subcategoryId = c.req.param("subcategoryId");
      // ensure id is valid
      const validId = idSchema.safeParse(subcategoryId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid subcategory ID",
          },
          400,
        );
      }

      const { storeId } = c.get("user");

      // Use the repository method to get subcategory with products
      const subcategoryWithProducts =
        await SubcategoryRepository.findByIdWithProducts(subcategoryId);

      if (!subcategoryWithProducts) {
        return c.json(
          {
            status: "error",
            message: "Subcategory not found",
          },
          404,
        );
      }

      // Verify that the subcategory belongs to the correct store
      if (subcategoryWithProducts.storeId !== storeId) {
        return c.json(
          {
            status: "error",
            message: "Unauthorized access to this subcategory",
          },
          403,
        );
      }

      return c.json({
        status: "success",
        data: subcategoryWithProducts,
      });
    } catch (error) {
      console.error("Error in getSubcategoryByIdWithProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch subcategory with products",
        },
        500,
      );
    }
  }

  static async getSubcategoryById(c: Context) {
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

      const subcategory = await SubcategoryRepository.findById(id);
      if (!subcategory) {
        return c.json(
          {
            status: "error",
            message: "Subcategory not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: subcategory,
      });
    } catch (error) {
      console.error("Error in getSubcategoryById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch subcategory",
        },
        500,
      );
    }
  }
}
