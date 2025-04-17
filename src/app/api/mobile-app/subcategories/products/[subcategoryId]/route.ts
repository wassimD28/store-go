import { Hono } from "hono";
import { handle } from "hono/vercel";
import { SubcategoryController } from "@/server/controllers/subcategory.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/subcategories/products")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Get subcategory by ID with products
  .get("/:subcategoryId", SubcategoryController.getSubcategoryByIdWithProducts);

export const GET = handle(app);
