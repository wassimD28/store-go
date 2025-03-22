import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products/category")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get products by category ID
  .get("/:categoryId", ProductController.getProductsByCategory);

export const GET = handle(app);
