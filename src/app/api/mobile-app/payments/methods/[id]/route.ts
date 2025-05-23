import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PaymentController } from "@/server/controllers/payment.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/payments/methods")
  .use("*", isAuthenticated)
  .delete("/:id", PaymentController.deletePaymentMethod);

export const DELETE = handle(app);
