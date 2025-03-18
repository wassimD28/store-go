import { Hono } from "hono";
import { handle } from "hono/vercel";

import { CategoryController } from "@/server/controllers/category.controller";

// Create the Hono app for category endpoints
const app = new Hono().basePath("/api/mobile-app/categories/:id")

// Get category by ID
.get("/:id", CategoryController.getCategoryById)

// Create a new category
.delete("/:id", CategoryController.createCategory)

// Update a category
.put("/:id", CategoryController.updateCategory)



// Export a single handler for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);