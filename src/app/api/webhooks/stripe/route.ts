import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe.config";
import { PaymentRepository } from "@/server/repositories/payment.repository";
import { OrderRepository } from "@/server/repositories/order.repository";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Stripe webhook: Missing signature");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: Missing webhook secret in environment");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "payment_intent.requires_action":
        await handlePaymentRequiresAction(event.data.object);
        break;

      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("Payment succeeded but no orderId in metadata");
      return;
    }

    // Find payment by Stripe ID
    const payment = await PaymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );
    if (payment) {
      // Update payment status
      await PaymentRepository.updateStatus(payment.id, "paid");

      // Update order payment status
      await OrderRepository.updatePaymentStatus(orderId, "paid");

      console.log(
        `Payment succeeded for order ${orderId}, payment ${payment.id}`,
      );
    } else {
      console.error(
        `Payment not found for Stripe payment intent ${paymentIntent.id}`,
      );
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;
    const lastPaymentError = paymentIntent.last_payment_error;

    // Find payment by Stripe ID
    const payment = await PaymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      // Update payment status with error details
      await PaymentRepository.updateStatus(
        payment.id,
        "failed",
        lastPaymentError?.message || "Payment failed",
        lastPaymentError?.code || "payment_failed",
      );

      console.log(`Payment failed for order ${orderId}, payment ${payment.id}`);
    } else {
      console.error(
        `Payment not found for Stripe payment intent ${paymentIntent.id}`,
      );
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

// Handle payment requiring action (3D Secure)
async function handlePaymentRequiresAction(
  paymentIntent: Stripe.PaymentIntent,
) {
  try {
    const payment = await PaymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      await PaymentRepository.updateStatus(payment.id, "requires_action");
      console.log(`Payment requires action: ${payment.id}`);
    }
  } catch (error) {
    console.error("Error handling payment requires action:", error);
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await PaymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      await PaymentRepository.updateStatus(payment.id, "canceled");
      console.log(`Payment canceled: ${payment.id}`);
    }
  } catch (error) {
    console.error("Error handling payment canceled:", error);
  }
}
