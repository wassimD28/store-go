import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import * as schema from "../../lib/db/schema";

// Define a proper type for the JSON attributes
export interface ProductAttributes {
  [key: string]: string | number | boolean | string[] | number[] | ProductAttributes;
}

export interface ProductCreateInput {
  category_id: number;
  name: string;
  description: string;
  price: string; // String to match schema expectations for decimal
  attributes: ProductAttributes;
  image_urls: string;
  stock_quantity: number;
}

export interface ProductUpdateInput {
  category_id?: number;
  name?: string;
  description?: string;
  price?: string; // String to match schema expectations for decimal
  attributes?: ProductAttributes;
  image_urls?: string;
  stock_quantity?: number;
}

// Define a type for product update fields
type ProductUpdateFields = {
  name?: string;
  description?: string;
  category_id?: number;
  price?: string;
  attributes?: ProductAttributes;
  image_urls?: string;
  stock_quantity?: number;
  updated_at: Date;
}

export class ProductRepository {
  static async findAll() {
    try {
      return await db.query.AppProduct.findMany();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  static async findById(id: number) {
    try {
      return await db.query.AppProduct.findFirst({
        where: eq(schema.AppProduct.id, id)
      });
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw new Error(`Failed to fetch product with ID ${id}`);
    }
  }

  static async findByCategory(categoryId: number) {
    try {
      return await db.query.AppProduct.findMany({
        where: eq(schema.AppProduct.category_id, categoryId)
      });
    } catch (error) {
      console.error(`Error fetching products for category ID ${categoryId}:`, error);
      throw new Error(`Failed to fetch products for category ID ${categoryId}`);
    }
  }

  static async create(data: ProductCreateInput) {
    try {
      // Create a new object that matches the expected schema type
      const productData = {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        attributes: data.attributes,
        image_urls: data.image_urls,
        stock_quantity: data.stock_quantity
      };
      
      const result = await db.insert(schema.AppProduct).values(productData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  static async update(id: number, data: ProductUpdateInput) {
    try {
      // Create an update object with a proper type instead of using Record<string, any>
      const updateData: ProductUpdateFields = { updated_at: new Date() };
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category_id !== undefined) updateData.category_id = data.category_id;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.attributes !== undefined) updateData.attributes = data.attributes;
      if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;
      if (data.stock_quantity !== undefined) updateData.stock_quantity = data.stock_quantity;
      
      const result = await db
        .update(schema.AppProduct)
        .set(updateData)
        .where(eq(schema.AppProduct.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw new Error(`Failed to update product with ID ${id}`);
    }
  }

  static async updateStock(id: number, quantity: number) {
    try {
      const result = await db
        .update(schema.AppProduct)
        .set({ 
          stock_quantity: quantity,
          updated_at: new Date() 
        })
        .where(eq(schema.AppProduct.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating stock for product ID ${id}:`, error);
      throw new Error(`Failed to update stock for product ID ${id}`);
    }
  }

  static async delete(id: number) {
    try {
      return await db
        .delete(schema.AppProduct)
        .where(eq(schema.AppProduct.id, id))
        .returning();
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw new Error(`Failed to delete product with ID ${id}`);
    }
  }
}