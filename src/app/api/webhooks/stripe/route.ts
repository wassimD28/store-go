import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe.config";
import { PaymentRepository } from "@/server/repositories/payment.repository";
import { OrderRepository } from "@/server/repositories/order.repository";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Find payment by Stripe ID
        const payment = await PaymentRepository.findByStripePaymentIntentId(
          paymentIntent.id,
        );

        if (payment) {
          await PaymentRepository.updateStatus(payment.id, "succeeded");
          await OrderRepository.updatePaymentStatus(orderId, "paid");
        }
        break;

      case "payment_intent.payment_failed":
        // Handle failed payments
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
