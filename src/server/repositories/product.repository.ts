import { db } from "@/lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppProduct } from "@/lib/db/schema";

export class ProductRepository {
  static async findAll(storeId: string) {
    try {
      return await db.query.AppProduct.findMany({
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
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  static async findById(id: string) {
    try {
      const product = await db.query.AppProduct.findFirst({
        where: eq(AppProduct.id, id),
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
            orderBy: (review) => review.created_at,
          },
        },
      });

      if (!product) {
        return null;
      }

      return {
        ...product,
        colors: product.colors || [],
        size: product.size || [],
        reviews: product.reviews || [],
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product ${id}`);
    }
  }

  static async findByCategory(categoryId: string, storeId: string) {
    try {
      return await db.query.AppProduct.findMany({
        where: and(
          eq(AppProduct.categoryId, categoryId),
          eq(AppProduct.storeId, storeId),
        ),
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
      });
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error,
      );
      throw new Error(`Failed to fetch products for category ${categoryId}`);
    }
  }
}
