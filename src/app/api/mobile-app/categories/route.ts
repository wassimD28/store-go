// src/app/mobile-app/categories/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CategoryController } from "@/server/controllers/category.controller";

// Initialize the category controller
const categoryController = new CategoryController();

// Create the Hono app for category endpoints
const app = new Hono().basePath("/api/mobile-app/categories");

// Root route - basic information
app.get("/", (c) => {
  return c.json({
    message: "Categories API endpoint for mobile app",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Retrieve all categories
app.get("/list", async (c) => await categoryController.getAllCategories(c));

// Retrieve a category by ID
app.get("/:id", async (c) => await categoryController.getCategoryById(c));

// Retrieve products of a category
app.get("/:id/products", async (c) => await categoryController.getCategoryProducts(c));

// Create a new category
app.post("/create", async (c) => await categoryController.createCategory(c));

// Update a category
app.put("/:id/update", async (c) => await categoryController.updateCategory(c));

// Delete a category
app.delete("/:id/delete", async (c) => await categoryController.deleteCategory(c));

// Export handlers for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
