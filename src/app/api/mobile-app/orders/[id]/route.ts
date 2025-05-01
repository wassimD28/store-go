import { Hono } from "hono";
import { handle } from "hono/vercel";
import { OrderController } from "@/server/controllers/order.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/orders")
  // check if user is authenticated
  .use("*", isAuthenticated)
  // Get order by ID
  .get("/:id", OrderController.getOrderById)
  // Update order
  .put("/:id", OrderController.updateOrder)
  // Delete order
  .delete("/:id", OrderController.deleteOrder);

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);