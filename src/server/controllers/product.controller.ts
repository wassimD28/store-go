import { Context } from "hono";
import { ProductRepository, ProductCreateInput, ProductUpdateInput } from "@/server/repositories/product.repository";

export class ProductController {
  static async getAllProducts(c: Context) {
    try {
      const products = await ProductRepository.findAll();
      return c.json({
        status: "success",
        data: products
      });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch products"
      }, 500);
    }
  }

  static async getProductById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid product ID"
        }, 400);
      }

      const product = await ProductRepository.findById(id);
      if (!product) {
        return c.json({
          status: "error",
          message: "Product not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: product
      });
    } catch (error) {
      console.error("Error in getProductById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch product"
      }, 500);
    }
  }

  static async getProductsByCategory(c: Context) {
    try {
      const categoryId = parseInt(c.req.param("categoryId"));
      if (isNaN(categoryId)) {
        return c.json({
          status: "error",
          message: "Invalid category ID"
        }, 400);
      }

      const products = await ProductRepository.findByCategory(categoryId);
      
      return c.json({
        status: "success",
        data: products
      });
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch products by category"
      }, 500);
    }
  }

  static async createProduct(c: Context) {
    try {
      const body = await c.req.json();
      
      // Validate required fields
      const requiredFields = ["category_id", "name", "price"];
      for (const field of requiredFields) {
        if (!(field in body)) {
          return c.json({
            status: "error",
            message: `Missing required field: ${field}`
          }, 400);
        }
      }

      const productData: ProductCreateInput = {
        category_id: body.category_id,
        name: body.name,
        description: body.description || "",
        price: body.price,
        attributes: body.attributes || {},
        image_urls: body.image_urls || "",
        stock_quantity: body.stock_quantity || 0
      };

      const newProduct = await ProductRepository.create(productData);
      
      return c.json({
        status: "success",
        message: "Product created successfully",
        data: newProduct
      }, 201);
    } catch (error) {
      console.error("Error in createProduct:", error);
      return c.json({
        status: "error",
        message: "Failed to create product"
      }, 500);
    }
  }

  static async updateProduct(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid product ID"
        }, 400);
      }

      const body = await c.req.json();
      const updateData: ProductUpdateInput = {};

      // Only include fields that are present in the request
      if ("category_id" in body) updateData.category_id = body.category_id;
      if ("name" in body) updateData.name = body.name;
      if ("description" in body) updateData.description = body.description;
      if ("price" in body) updateData.price = body.price;
      if ("attributes" in body) updateData.attributes = body.attributes;
      if ("image_urls" in body) updateData.image_urls = body.image_urls;
      if ("stock_quantity" in body) updateData.stock_quantity = body.stock_quantity;

      if (Object.keys(updateData).length === 0) {
        return c.json({
          status: "error",
          message: "No valid fields provided for update"
        }, 400);
      }

      const existingProduct = await ProductRepository.findById(id);
      if (!existingProduct) {
        return c.json({
          status: "error",
          message: "Product not found"
        }, 404);
      }

      const updatedProduct = await ProductRepository.update(id, updateData);
      
      return c.json({
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return c.json({
        status: "error",
        message: "Failed to update product"
      }, 500);
    }
  }

  static async updateProductStock(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid product ID"
        }, 400);
      }

      const body = await c.req.json();
      if (!("stock_quantity" in body) || typeof body.stock_quantity !== "number") {
        return c.json({
          status: "error",
          message: "Missing or invalid stock_quantity field"
        }, 400);
      }

      const existingProduct = await ProductRepository.findById(id);
      if (!existingProduct) {
        return c.json({
          status: "error",
          message: "Product not found"
        }, 404);
      }

      const updatedProduct = await ProductRepository.updateStock(id, body.stock_quantity);
      
      return c.json({
        status: "success",
        message: "Product stock updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      console.error("Error in updateProductStock:", error);
      return c.json({
        status: "error",
        message: "Failed to update product stock"
      }, 500);
    }
  }

  static async deleteProduct(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid product ID"
        }, 400);
      }

      const existingProduct = await ProductRepository.findById(id);
      if (!existingProduct) {
        return c.json({
          status: "error",
          message: "Product not found"
        }, 404);
      }

      await ProductRepository.delete(id);
      
      return c.json({
        status: "success",
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      return c.json({
        status: "error",
        message: "Failed to delete product"
      }, 500);
    }
  }
}