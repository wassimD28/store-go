/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { AppProduct } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";

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
  status,
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
  status?: "draft" | "published" | "out_of_stock" | "archived";
}): Promise<ActionResponse<any>> => {
  try {
    // Insert new product
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
        // Convert JavaScript object to JSON for the attributes field
        attributes: attributes as any, // Type assertion to bypass the type checking temporarily
        status: status || "draft", // Use the provided status or default to "draft"
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
    const products = await db.query.AppProduct.findMany({
      where: eq(AppProduct.storeId, storeId),
    });
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
  status,
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
  status?: "draft" | "published" | "out_of_stock" | "archived";
}): Promise<ActionResponse<any>> => {
  try {
    // Update existing product
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
        // Convert JavaScript object to JSON for the attributes field
        attributes: attributes as any, // Type assertion to bypass the type checking temporarily
        status: status || "draft", // Use the provided status or default to "draft"
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
