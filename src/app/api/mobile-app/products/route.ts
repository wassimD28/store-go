import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ProductController } from "@/server/controllers/product.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/products")
  // Check if user is authenticated
  .use("*", isAuthenticated)
  // Retrieve all products
  .get("/", ProductController.getAllProducts);

export const GET = handle(app);

