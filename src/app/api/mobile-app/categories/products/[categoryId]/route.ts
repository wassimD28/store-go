import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CategoryController } from "@/server/controllers/category.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/categories/products")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Get category by ID
  .get("/:categoryId", CategoryController.getCategoryByIdWithProducts);
  
export const GET = handle(app);
