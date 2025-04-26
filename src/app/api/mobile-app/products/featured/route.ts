import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products/featured")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get featured products
  .get("/", ProductController.getFeaturedProducts);

export const GET = handle(app);
