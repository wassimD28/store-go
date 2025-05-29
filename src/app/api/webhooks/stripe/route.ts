import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe.config";
import { PaymentRepository } from "@/server/repositories/payment.repository";
import { OrderRepository } from "@/server/repositories/order.repository";
import { StoreNotificationRepository } from "@/server/repositories/notification.repository";
import Stripe from "stripe";
import Pusher from "pusher";

// Initialize Pusher for real-time notifications
let pusherServer: Pusher | null = null;
if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
}

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

      // Get order details for notification
      const order = await OrderRepository.findByIdWithoutUser(orderId);

      if (order) {
        // Create notification for payment received
        try {
          const notificationData = {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentAmount: paymentIntent.amount / 100, // Convert from cents
            paymentIntentId: paymentIntent.id,
            paymentStatus: "paid",
          };

          await StoreNotificationRepository.create({
            storeId: order.storeId,
            type: "payment_received",
            title: "Payment Received",
            content: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received for order #${order.orderNumber}`,
            data: notificationData,
          });

          // Send real-time notification via Pusher
          if (pusherServer) {
            await pusherServer.trigger(
              `store-${order.storeId}`,
              "payment-received",
              {
                type: "payment_received",
                title: "Payment Received",
                content: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received for order #${order.orderNumber}`,
                data: notificationData,
              },
            );
          }
        } catch (notificationError) {
          console.error(
            "Error creating payment notification:",
            notificationError,
          );
        }
      }

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

      // Get order details for notification
      if (orderId) {
        const order = await OrderRepository.findByIdWithoutUser(orderId);

        if (order) {
          // Create notification for payment failure
          try {
            const notificationData = {
              orderId: order.id,
              orderNumber: order.orderNumber,
              paymentAmount: paymentIntent.amount / 100,
              paymentIntentId: paymentIntent.id,
              paymentStatus: "failed",
              errorMessage: lastPaymentError?.message || "Payment failed",
              errorCode: lastPaymentError?.code || "payment_failed",
            };

            await StoreNotificationRepository.create({
              storeId: order.storeId,
              type: "refund_request", // Using closest available type for failed payments
              title: "Payment Failed",
              content: `Payment failed for order #${order.orderNumber}. Error: ${lastPaymentError?.message || "Unknown error"}`,
              data: notificationData,
            });

            // Send real-time notification via Pusher
            if (pusherServer) {
              await pusherServer.trigger(
                `store-${order.storeId}`,
                "payment-failed",
                {
                  type: "payment_failed",
                  title: "Payment Failed",
                  content: `Payment failed for order #${order.orderNumber}. Error: ${lastPaymentError?.message || "Unknown error"}`,
                  data: notificationData,
                },
              );
            }
          } catch (notificationError) {
            console.error(
              "Error creating payment failure notification:",
              notificationError,
            );
          }
        }
      }

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
    const orderId = paymentIntent.metadata?.orderId;

    const payment = await PaymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      await PaymentRepository.updateStatus(payment.id, "requires_action");

      // Get order details for notification
      if (orderId) {
        const order = await OrderRepository.findByIdWithoutUser(orderId);

        if (order) {
          // Create notification for payment requiring action
          try {
            const notificationData = {
              orderId: order.id,
              orderNumber: order.orderNumber,
              paymentAmount: paymentIntent.amount / 100,
              paymentIntentId: paymentIntent.id,
              paymentStatus: "requires_action",
            };

            await StoreNotificationRepository.create({
              storeId: order.storeId,
              type: "security_alert", // Using closest available type for payment requiring action
              title: "Payment Requires Action",
              content: `Payment for order #${order.orderNumber} requires additional authentication (3D Secure)`,
              data: notificationData,
            });

            // Send real-time notification via Pusher
            if (pusherServer) {
              await pusherServer.trigger(
                `store-${order.storeId}`,
                "payment-requires-action",
                {
                  type: "payment_requires_action",
                  title: "Payment Requires Action",
                  content: `Payment for order #${order.orderNumber} requires additional authentication (3D Secure)`,
                  data: notificationData,
                },
              );
            }
          } catch (notificationError) {
            console.error(
              "Error creating payment requires action notification:",
              notificationError,
            );
          }
        }
      }

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
