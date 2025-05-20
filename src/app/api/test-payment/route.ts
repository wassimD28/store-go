// filepath: src/app/api/test-payment/route.ts
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe.config";
import { stripeMode } from "@/lib/stripe/stripe.config";

/**
 * Test payment processing endpoint
 * This API is used only for testing Stripe integration
 */
export async function POST(request: Request) {
  // Only allow this endpoint in test mode
  if (stripeMode !== "test") {
    return NextResponse.json(
      { success: false, message: "Test endpoint only available in test mode" },
      { status: 403 },
    );
  }
  try {
    const body = await request.json();
    const {
      paymentMethodId,
      amount,
      currency = "usd",
      description,
    }: {
      paymentMethodId: string;
      amount: number;
      currency?: string;
      description?: string;
    } = body;

    if (!paymentMethodId || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method ID and amount are required",
        },
        { status: 400 },
      );
    } // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        payment_method: paymentMethodId,
        description: description || "StoreGo test payment",
        confirm: true, // Confirm the payment immediately
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment-result`,
        // Use automatic payment methods to support more payment methods
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "always",
        },
        metadata: {
          isTestPayment: "true",
        },
      },
      {
        // Use an idempotency key to prevent duplicate charges
        idempotencyKey: `test-payment-${Date.now()}`,
      },
    );

    // Return the client secret to the client to handle any additional actions required
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      requiresAction: paymentIntent.status === "requires_action",
    });
  } catch (error) {
    console.error("Error processing test payment:", error);

    // Handle Stripe errors specifically
    if (error instanceof Error) {
      const stripeError = error as Error & { type?: string };
      return NextResponse.json(
        {
          success: false,
          message:
            stripeError.message || "An error occurred processing the payment",
          error: stripeError.type || "payment_error",
        },
        { status: 400 },
      );
    }

    // Fallback for any other error type
    return NextResponse.json(
      {
        success: false,
        message: "An unknown error occurred processing the payment",
        error: "unknown_error",
      },
      { status: 400 },
    );
  }
}
