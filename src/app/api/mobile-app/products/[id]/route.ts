import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Get product by ID
  .get("/:id", ProductController.getProductById)

export const GET = handle(app);