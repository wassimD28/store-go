import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CategoryController } from "@/server/controllers/category.controller";



const app = new Hono().basePath("/api/mobile-app/categories")
  // Retrieve all categories
  .get("/", CategoryController.getAllCategories)
  // Create a new category
  .post("/", CategoryController.createCategory);



// Export a single handler for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);