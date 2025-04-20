import { Context } from "hono";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { AppProduct } from "@/lib/db/schema";

export class ProductController {
  static async getAllProducts(c: Context) {
    try {
      const { storeId } = c.get("user");
      const query = c.req.query();

      let products;
      if (query.featured === "true") {
        products = await db.query.AppProduct.findMany({
          where: eq(AppProduct.storeId, storeId),
          columns: {
            id: true,
            userId: true,
            storeId: true,
            categoryId: true,
            subcategoryId: true,
            name: true,
            description: true,
            price: true,
            attributes: true,
            colors: true,
            size: true,
            image_urls: true,
            stock_quantity: true,
            status: true,
            targetGender: true,
            unitsSold: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: desc(AppProduct.unitsSold),
        });
      } else if (query.sort === "newest") {
        products = await db.query.AppProduct.findMany({
          where: eq(AppProduct.storeId, storeId),
          columns: {
            id: true,
            userId: true,
            storeId: true,
            categoryId: true,
            subcategoryId: true,
            name: true,
            description: true,
            price: true,
            attributes: true,
            colors: true,
            size: true,
            image_urls: true,
            stock_quantity: true,
            status: true,
            targetGender: true,
            unitsSold: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: desc(AppProduct.created_at),
        });
      } else {
        products = await ProductRepository.findAll(storeId);
      }

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
        500,
      );
    }
  }

  static async getProductById(c: Context) {
    try {
      const id = c.req.param("id");
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

      const product = await ProductRepository.findById(id);
      if (!product) {
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404,
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
        500,
      );
    }
  }

  static async getProductsByCategory(c: Context) {
    try {
      const categoryId = c.req.param("categoryId");
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

      const products = await ProductRepository.findByCategory(
        categoryId,
        storeId,
      );
      console.log(
        `Found ${products.length} products for category ${categoryId}`,
      );

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
        500,
      );
    }
  }
}
