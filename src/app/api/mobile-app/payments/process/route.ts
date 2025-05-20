import { Context, Hono } from "hono";
import { handle } from "hono/vercel";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";
import { PaymentService } from "@/server/services/payment.service";
import { z } from "zod";

const app = new Hono()
  .basePath("/api/mobile-app/payments/process")
  .use("*", isAuthenticated);

// Define schema for payment request
const processPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(0, "Amount must be a positive number"),
  currency: z.string().min(3).max(3).default("USD"),
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
  description: z.string().optional(),
});

// Process payment endpoint
app.post("/", async (c: Context) => {
  try {
    const { userId } = c.get("user");
    const body = await c.req.json();

    const validationResult = processPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          status: "error",
          message: "Invalid payment data",
          errors: validationResult.error.errors,
        },
        400,
      );
    }

    const { orderId, amount, currency, paymentMethodId, description } =
      validationResult.data;

    // Create a payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      amount,
      currency,
      orderId,
      userId,
      paymentMethodId,
      description,
    });

    // If payment intent is successful, process the payment
    if (paymentIntent.status === "succeeded") {
      const payment = await PaymentService.processPayment({
        paymentIntentId: paymentIntent.id,
        orderId,
        amount,
        paymentMethod: "credit_card", // This would come from the payment method type
      });

      return c.json({
        status: "success",
        message: "Payment processed successfully",
        data: {
          paymentId: payment.id,
          paymentIntent: paymentIntent.id,
          status: payment.status,
        },
      });
    }

    // If payment needs additional actions (like 3D Secure)
    return c.json({
      status: "requires_action",
      message: "Additional authentication required",
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return c.json(
      {
        status: "error",
        message: "Failed to process payment",
      },
      500,
    );
  }
});

export const POST = handle(app);
