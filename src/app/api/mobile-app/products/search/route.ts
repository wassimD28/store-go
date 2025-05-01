import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products/search")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Search products
  .get("/", ProductController.searchProducts);

export const GET = handle(app);
