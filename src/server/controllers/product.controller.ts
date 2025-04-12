import { Context } from "hono";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";

export class ProductController {
  static async getAllProducts(c: Context) {
    try {
      const { storeId } = c.get("user");
      const products = await ProductRepository.findAll(storeId);
      return c.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch products",
        },
        500
      );
    }
  }

  static async getProductById(c: Context) {
    try {
      const id = c.req.param("id");
      // Ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid ID",
          },
          400
        );
      }

      const product = await ProductRepository.findById(id);
      if (!product) {
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404
        );
      }

      return c.json({
        status: "success",
        data: product,
      });
    } catch (error) {
      console.error("Error in getProductById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch product",
        },
        500
      );
    }
  }

  static async getProductsByCategory(c: Context) {
    try {
      const categoryId = c.req.param("categoryId");
      // Ensure categoryId is valid
      const validId = idSchema.safeParse(categoryId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid category ID",
          },
          400
        );
      }
      const { storeId } = c.get("user");

      // Make sure we're actually filtering by categoryId in the database query
      // This appears to be the root of the issue
      const products = await ProductRepository.findByCategory(categoryId, storeId);
      
      console.log(`Found ${products.length} products for category ${categoryId}`);

      return c.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch products by category",
        },
        500
      );
    }
  }
}