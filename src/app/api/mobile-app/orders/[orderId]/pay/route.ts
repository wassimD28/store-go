import { Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { PaymentController } from "@/server/controllers/payment.controller";

const app = new Hono()
  .basePath("/api/mobile-app/orders")
  .use("*", isAuthenticated)
  .post("/:orderId/pay", PaymentController.payForOrder);

export const POST = handle(app);
