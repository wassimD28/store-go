import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products/filter")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get filtered products
  .get("/", ProductController.getFilteredProducts);

export const GET = handle(app);
