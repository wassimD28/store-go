import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PaymentController } from "@/server/controllers/payment.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/payments/methods")
  .use("*", isAuthenticated)
  .get("/", PaymentController.getPaymentMethods)
  .post("/", PaymentController.createPaymentMethod);

export const GET = handle(app);
export const POST = handle(app);
