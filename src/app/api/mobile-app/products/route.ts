import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";

// Initialize the product controller
const productController = new ProductController();

// Create the Hono app for product endpoints
const app = new Hono().basePath("/api/mobile-app/products");

// Root route - basic information
app.get("/", (c) => {
  return c.json({
    message: "Products API endpoint for mobile app",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Retrieve all products
app.get("/list", async (c) => await productController.getAllProducts(c));

// Retrieve a product by ID
app.get("/:id", async (c) => await productController.getProductById(c));

// Create a new product
app.post("/create", async (c) => await productController.createProduct(c));

// Update a product
app.put("/:id/update", async (c) => await productController.updateProduct(c));

// Delete a product
app.delete("/:id/delete", async (c) => await productController.deleteProduct(c));

// Export request handlers for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
