/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { AppProduct } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";

// Updated to match the new schema structure
export const createProduct = async ({
  userId,
  storeId,
  name,
  description,
  price,
  categoryId,
  subcategoryId,
  stock_quantity,
  image_urls,
  attributes,
  colors,
  size,
  status,
  targetGender,
}: {
  userId: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  subcategoryId: string | null;
  stock_quantity: number;
  image_urls: string[] | null;
  attributes: Record<string, string>;
  colors?: any[];
  size?: string[];
  status?: "draft" | "published" | "out_of_stock" | "archived";
  targetGender?: "male" | "female" | "unisex";
}): Promise<ActionResponse<any>> => {
  try {
    // Insert new product with updated schema
    const [newProduct] = await db
      .insert(AppProduct)
      .values({
        userId,
        storeId,
        name,
        description,
        price: price.toString(),
        categoryId,
        subcategoryId,
        stock_quantity,
        image_urls,
        attributes: attributes as any, // Custom attributes
        colors: colors || {}, // New dedicated colors field
        size: size || {}, // New dedicated size field
        status: status || "draft",
        targetGender: targetGender || "unisex", // New target gender field
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return { success: true, data: newProduct };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
};

export const getProductsByStore = async (storeId: string) => {
  try {
    // Updated select to include new schema fields
    const products = await db
      .select({
        id: AppProduct.id,
        userId: AppProduct.userId,
        storeId: AppProduct.storeId,
        name: AppProduct.name,
        description: AppProduct.description,
        price: AppProduct.price,
        status: AppProduct.status,
        stock_quantity: AppProduct.stock_quantity,
        categoryId: AppProduct.categoryId,
        subcategoryId: AppProduct.subcategoryId,
        image_urls: AppProduct.image_urls,
        created_at: AppProduct.created_at,
        updated_at: AppProduct.updated_at,
        attributes: AppProduct.attributes,
        colors: AppProduct.colors,
        size: AppProduct.size,
        targetGender: AppProduct.targetGender,
        unitsSold: AppProduct.unitsSold,
      })
      .from(AppProduct)
      .where(eq(AppProduct.storeId, storeId));

    return { success: true, products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve products",
    };
  }
};

export const getProductById = async (productId: string) => {
  try {
    const product = await db.query.AppProduct.findFirst({
      where: eq(AppProduct.id, productId),
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve product",
    };
  }
};

export const deleteProduct = async (
  productId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    const [deletedProduct] = await db
      .delete(AppProduct)
      .where(eq(AppProduct.id, productId))
      .returning({ id: AppProduct.id });

    if (!deletedProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    return {
      success: true,
      data: { id: deletedProduct.id },
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
};

export const updateProduct = async ({
  id,
  name,
  description,
  price,
  categoryId,
  subcategoryId,
  stock_quantity,
  image_urls,
  attributes,
  colors,
  size,
  status,
  targetGender,
}: {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  subcategoryId: string | null;
  stock_quantity: number;
  image_urls: string[] | null;
  attributes: Record<string, string>;
  colors?: any[];
  size?: string[];
  status?: "draft" | "published" | "out_of_stock" | "archived";
  targetGender?: "male" | "female" | "unisex";
}): Promise<ActionResponse<any>> => {
  try {
    // Update existing product with new schema fields
    const [updatedProduct] = await db
      .update(AppProduct)
      .set({
        name,
        description,
        price: price.toString(),
        categoryId,
        subcategoryId,
        stock_quantity,
        image_urls,
        attributes: attributes as any,
        colors: colors || {}, // Updated colors field
        size: size || {}, // Updated size field
        status: status || "draft",
        targetGender: targetGender || "unisex", // Updated target gender field
        updated_at: new Date(),
      })
      .where(eq(AppProduct.id, id))
      .returning();

    if (!updatedProduct) {
      return {
        success: false,
        error: "Product not found or you don't have permission to update it",
      };
    }

    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
};
