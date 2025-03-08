import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";

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
app.get("/list", ProductController.getAllProducts);

// Get products by category ID
app.get("/category/:categoryId", ProductController.getProductsByCategory);

// Get product by ID
app.get("/:id", ProductController.getProductById);

// Create a new product
app.post("/create", ProductController.createProduct);

// Update a product
app.put("/:id", ProductController.updateProduct);

// Delete a product
app.delete("/:id", ProductController.deleteProduct);

// Update product stock quantity
app.patch("/:id/stock", ProductController.updateProductStock);

// Export a single handler for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);