import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { OrderController } from "@/server/controllers/order.controller";

const app = new Hono()
  .basePath("/api/mobile-app/orders")
  .use("*", isAuthenticated)
  .get("/:orderId", OrderController.getOrderById)
  .put("/:orderId", OrderController.updateOrder);

export const GET = handle(app);
export const PUT = handle(app);
