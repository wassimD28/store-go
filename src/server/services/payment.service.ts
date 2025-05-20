import stripe from "@/lib/stripe/stripe.config";
import { PaymentRepository } from "../repositories/payment.repository";

// Types for the payment service
type CreatePaymentIntentParams = {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  paymentMethodId?: string;
  description?: string;
};

type ProcessPaymentParams = {
  paymentIntentId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
};

export class PaymentService {
  // Create a payment intent with Stripe
  static async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const {
        amount,
        currency,
        orderId,
        userId,
        paymentMethodId,
        description,
      } = params;

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        payment_method: paymentMethodId,
        metadata: {
          orderId,
          userId,
        },
        description: description || `Payment for order ${orderId}`,
        // Only confirm if a payment method is provided
        ...(paymentMethodId && { confirm: true }),
      });

      return paymentIntent;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  }

  // Process a payment after payment intent confirmation
  static async processPayment(params: ProcessPaymentParams) {
    try {
      const { paymentIntentId, orderId, amount, paymentMethod } = params;

      // Retrieve the payment intent to check its status
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        throw new Error(
          `Payment intent is not successful. Status: ${paymentIntent.status}`,
        );
      }

      // Create a payment record in the database
      const payment = await PaymentRepository.create({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
        status: "completed",
        payment_date: new Date(),
      });

      return payment;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw new Error("Failed to process payment");
    }
  }

  // Get a payment method
  static async retrievePaymentMethod(paymentMethodId: string) {
    try {
      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      console.error("Error retrieving payment method:", error);
      throw new Error("Failed to retrieve payment method");
    }
  }
}
