import { Hono } from "hono";
import { handle } from "hono/vercel";
import { SubcategoryController } from "@/server/controllers/subcategory.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/subcategories")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Retrieve all subcategories
  .get("/", SubcategoryController.getAllSubcategories);

export const GET = handle(app);
