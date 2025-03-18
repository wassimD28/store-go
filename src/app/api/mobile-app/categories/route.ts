import { Hono } from "hono";
import { handle } from "hono/vercel";
import { CategoryController } from "@/server/controllers/category.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/categories")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Retrieve all categories
  .get("/", CategoryController.getAllCategories);

export const GET = handle(app);
