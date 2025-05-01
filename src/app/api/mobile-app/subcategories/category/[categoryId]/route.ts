import { Hono } from "hono";
import { handle } from "hono/vercel";
import { SubcategoryController } from "@/server/controllers/subcategory.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/subcategories/category")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Get subcategories by category ID
  .get("/:categoryId", SubcategoryController.getSubcategoriesByCategoryId);

export const GET = handle(app);
