import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CategoryController } from "@/server/controllers/category.controller";

// Create the Hono app for category endpoints
const app = new Hono().basePath("/api/mobile-app/categories");

// Retrieve all categories
app.get("/", CategoryController.getAllCategories);

// Get category by ID
app.get("/:id", CategoryController.getCategoryById);

// Create a new category
app.post("/", CategoryController.createCategory);

// Update a category
app.put("/:id", CategoryController.updateCategory);

// Delete a category
app.delete("/:id", CategoryController.deleteCategory);

// Export a single handler for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);