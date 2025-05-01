import { Context } from "hono";
import { ProductRepository } from "@/server/repositories/product.repository";
import { idSchema } from "../schemas/common.schema";
import { db } from "@/lib/db/db";
import { AppProduct } from "@/lib/db/schema";
import { and, desc, eq, gte, lte, or, sql, asc } from "drizzle-orm";

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
  // Add these methods to src\server\controllers\product.controller.ts

  static async searchProducts(c: Context) {
    try {
      const { storeId } = c.get("user");
      const query = c.req.query();
      const searchTerm = query.search;

      if (!searchTerm) {
        return c.json(
          {
            status: "error",
            message: "Search term is required",
          },
          400,
        );
      }

      // Search products by name or description
      const products = await db.query.AppProduct.findMany({
        where: (product) => {
          return and(
            eq(product.storeId, storeId),
            or(
              sql`${product.name} ILIKE ${`%${searchTerm}%`}`,
              sql`${product.description} ILIKE ${`%${searchTerm}%`}`,
            ),
          );
        },
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
        with: {
          reviews: {
            with: {
              appUser: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return c.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("Error in searchProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to search products",
        },
        500,
      );
    }
  }

  static async getNewProducts(c: Context) {
    try {
      const { storeId } = c.get("user");

      // Get products sorted by creation date (newest first)
      const products = await db.query.AppProduct.findMany({
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
        with: {
          reviews: {
            with: {
              appUser: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        limit: 20, // Limit to most recent products
      });

      return c.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("Error in getNewProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch new products",
        },
        500,
      );
    }
  }

  static async getFeaturedProducts(c: Context) {
    try {
      const { storeId } = c.get("user");

      // Get featured products (sorting by units sold as a proxy for featured status)
      const products = await db.query.AppProduct.findMany({
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
        with: {
          reviews: {
            with: {
              appUser: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        limit: 10, // Limit to top products
      });

      return c.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("Error in getFeaturedProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch featured products",
        },
        500,
      );
    }
  }

  static async getFilteredProducts(c: Context) {
    try {
      const { storeId } = c.get("user");
      const query = c.req.query();

      // Extract filter parameters
      const categoryId = query.category_id;
      const subcategoryId = query.subcategory_id;
      const minPrice = query.min_price
        ? parseFloat(query.min_price)
        : undefined;
      const maxPrice = query.max_price
        ? parseFloat(query.max_price)
        : undefined;
      const minRating = query.min_rating
        ? parseFloat(query.min_rating)
        : undefined;
      const sortOption = query.sort;

      // Build the where clause based on filters
      const conditions = [eq(AppProduct.storeId, storeId)];

      if (categoryId) {
        conditions.push(eq(AppProduct.categoryId, categoryId));
      }

      if (subcategoryId) {
        conditions.push(eq(AppProduct.subcategoryId, subcategoryId));
      }

      if (minPrice !== undefined) {
        conditions.push(gte(AppProduct.price, minPrice.toString()));
      }

      if (maxPrice !== undefined) {
        conditions.push(lte(AppProduct.price, maxPrice.toString()));
      }

      // Build the query
      const productsQuery = {
        where: and(...conditions),
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
        with: {
          reviews: {
            with: {
              appUser: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      };

      // Apply sorting
      let orderByClause;
      if (sortOption) {
        switch (sortOption) {
          case "created_at_desc":
            orderByClause = desc(AppProduct.created_at);
            break;
          case "sales_count_desc":
            orderByClause = desc(AppProduct.unitsSold);
            break;
          case "price_asc":
            orderByClause = asc(AppProduct.price);
            break;
          case "price_desc":
            orderByClause = desc(AppProduct.price);
            break;
          default:
            // Default sorting by creation date
            orderByClause = desc(AppProduct.created_at);
        }
      } else {
        orderByClause = desc(AppProduct.created_at);
      }

      const products = await db.query.AppProduct.findMany({
        ...productsQuery,
        orderBy: orderByClause,
      });

      // If minRating is specified, filter products by average rating
      let filteredProducts = products;
      if (minRating !== undefined) {
        filteredProducts = products.filter((product) => {
          if (!product.reviews || product.reviews.length === 0) {
            return false;
          }
          const avgRating =
            product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length;
          return avgRating >= minRating;
        });
      }

      return c.json({
        status: "success",
        data: filteredProducts,
      });
    } catch (error) {
      console.error("Error in getFilteredProducts:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch filtered products",
        },
        500,
      );
    }
  }
}
