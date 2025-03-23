import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PaymentController } from "@/server/controllers/payment.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/payments")
  .use("*", isAuthenticated)
  .get("/:id", PaymentController.getPaymentById)
  .put("/:id", PaymentController.updatePayment)
  .delete("/:id", PaymentController.deletePayment);

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);