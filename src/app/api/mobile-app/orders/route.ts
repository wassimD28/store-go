import { Hono } from "hono";
import { handle } from "hono/vercel";
import { OrderController } from "@/server/controllers/order.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/orders")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Retrieve all orders
  .get("/", OrderController.getAllOrders)
  // Create a new order
  .post("/", OrderController.createOrder);

export const GET = handle(app);
export const POST = handle(app);

