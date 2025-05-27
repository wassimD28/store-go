import { Context } from "hono";
import { PaymentRepository } from "@/server/repositories/payment.repository";
import { OrderRepository } from "@/server/repositories/order.repository"; // ✅ Add missing import
import { UserRepository } from "@/server/repositories/user.repository"; // ✅ Add UserRepository import
import { idSchema } from "../schemas/common.schema";
import {
  createPaymentSchema,
  updatePaymentSchema,
} from "../schemas/payment.schema";
import { z } from "zod"; // ✅ Add missing import

// Payment Method schemas
const createPaymentMethodSchema = z.object({
  type: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "apple_pay",
    "google_pay",
    "bank_transfer", // ✅ Added missing type from repository
  ]),
  stripePaymentMethodId: z.string(),
  isDefault: z.boolean().optional(),
  details: z
    .object({
      brand: z.string().optional(),
      last4: z.string().optional(),
      expiryMonth: z.string().optional(),
      expiryYear: z.string().optional(),
      cardholderName: z.string().optional(),
      email: z.string().optional(), // For PayPal
    })
    .optional(),
});

export class PaymentController {
  // ========== PAYMENT PROCESSING METHODS ==========

  static async getAllPayments(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context

      const payments = await PaymentRepository.findAllByUser(
        appUserId,
        storeId,
      );

      return c.json({
        status: "success",
        data: payments,
      });
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch payments",
        },
        500,
      );
    }
  }

  static async getPaymentById(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid ID",
          },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context

      const payment = await PaymentRepository.findByIdAndVerifyUser(
        id,
        appUserId,
        storeId,
      );

      if (!payment) {
        return c.json(
          {
            status: "error",
            message: "Payment not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: payment,
      });
    } catch (error) {
      console.error("Error in getPaymentById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch payment",
        },
        500,
      );
    }
  }

  static async createPayment(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context
      const body = await c.req.json();

      const paymentData = createPaymentSchema.safeParse(body);

      if (!paymentData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment data",
            errors: paymentData.error.errors,
          },
          400,
        );
      }

      // Verify that the order belongs to the current user in correct store
      const orderBelongsToUser = await PaymentRepository.verifyOrderOwnership(
        paymentData.data.order_id,
        appUserId,
        storeId,
      );
      if (!orderBelongsToUser) {
        return c.json(
          {
            status: "error",
            message: "Order not found or does not belong to the current user",
          },
          403,
        );
      }

      const newPayment = await PaymentRepository.create({
        ...paymentData.data,
        storeId, // Add storeId to payment data
      });

      return c.json(
        {
          status: "success",
          data: newPayment,
        },
        201,
      );
    } catch (error) {
      console.error("Error in createPayment:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to create payment",
        },
        500,
      );
    }
  }

  static async updatePayment(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid ID",
          },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context
      const body = await c.req.json();

      const paymentData = updatePaymentSchema.safeParse(body);
      if (!paymentData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment data",
            errors: paymentData.error.errors,
          },
          400,
        );
      }

      // Verify payment ownership
      const existingPayment = await PaymentRepository.findByIdAndVerifyUser(
        id,
        appUserId, // ✅ Fixed parameter name
        storeId, // ✅ Added missing storeId
      );
      if (!existingPayment) {
        return c.json(
          {
            status: "error",
            message: "Payment not found or does not belong to the current user",
          },
          404,
        );
      }

      const updatedPayment = await PaymentRepository.update(
        id,
        paymentData.data,
      );
      return c.json({
        status: "success",
        data: updatedPayment,
      });
    } catch (error) {
      console.error("Error in updatePayment:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to update payment",
        },
        500,
      );
    }
  }

  static async deletePayment(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid ID",
          },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context

      // Verify payment ownership
      const existingPayment = await PaymentRepository.findByIdAndVerifyUser(
        id,
        appUserId, // ✅ Fixed parameter name
        storeId, // ✅ Added missing storeId
      );
      if (!existingPayment) {
        return c.json(
          {
            status: "error",
            message: "Payment not found or does not belong to the current user",
          },
          404,
        );
      }

      await PaymentRepository.delete(id);
      return c.json({
        status: "success",
        message: "Payment deleted successfully",
      });
    } catch (error) {
      console.error("Error in deletePayment:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete payment",
        },
        500,
      );
    }
  }

  // ========== PAYMENT METHODS MANAGEMENT ==========

  static async getPaymentMethods(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context
      const paymentMethods = await PaymentRepository.findPaymentMethodsByUser(
        appUserId,
        storeId,
      );

      return c.json({
        status: "success",
        data: paymentMethods,
      });
    } catch (error) {
      console.error("Error in getPaymentMethods:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch payment methods",
        },
        500,
      );
    }
  }

  static async createPaymentMethod(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context
      const body = await c.req.json();

      const validationResult = createPaymentMethodSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment method data",
            errors: validationResult.error.errors,
          },
          400,
        );
      }

      const { type, stripePaymentMethodId, isDefault, details } =
        validationResult.data;

      const newPaymentMethod = await PaymentRepository.createPaymentMethod({
        storeId,
        appUserId,
        type,
        stripePaymentMethodId,
        details: details || {},
        isDefault,
      });

      return c.json(
        {
          status: "success",
          message: "Payment method added successfully",
          data: newPaymentMethod,
        },
        201,
      );
    } catch (error) {
      console.error("Error in createPaymentMethod:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to add payment method",
        },
        500,
      );
    }
  }

  static async setDefaultPaymentMethod(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment method ID",
          },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context

      const updatedPaymentMethod =
        await PaymentRepository.setDefaultPaymentMethod(id, appUserId, storeId);

      return c.json({
        status: "success",
        message: "Default payment method updated successfully",
        data: updatedPaymentMethod,
      });
    } catch (error) {
      console.error("Error in setDefaultPaymentMethod:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to set default payment method",
        },
        500,
      );
    }
  }

  static async deletePaymentMethod(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment method ID",
          },
          400,
        );
      }

      const { id: appUserId, storeId } = c.get("user"); // ✅ Fixed user context

      await PaymentRepository.deletePaymentMethod(id, appUserId, storeId);

      return c.json({
        status: "success",
        message: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error in deletePaymentMethod:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete payment method",
        },
        500,
      );
    }
  }

  // Add new method for order payment
  static async payForOrder(c: Context) {
    try {
      const orderId = c.req.param("orderId");
      const { id: appUserId, storeId } = c.get("user");

      // Validate order ID
      const validId = idSchema.safeParse(orderId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid order ID" }, 400);
      } // Validate request body
      const body = await c.req.json();
      const payOrderSchema = z.object({
        paymentMethod: z.string(),
        paymentToken: z.string().min(1, "Payment token is required"), // ✅ Required validation
        savePaymentMethod: z.boolean().optional(),
      });

      const validatedData = payOrderSchema.safeParse(body);
      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid payment data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      // Verify order exists and belongs to user
      const order = await OrderRepository.findById(orderId, appUserId, storeId);
      if (!order) {
        return c.json({ status: "error", message: "Order not found" }, 404);
      }

      // Check if order is already paid
      if (order.payment_status === "paid") {
        return c.json(
          { status: "error", message: "Order is already paid" },
          400,
        );
      } // Create payment record with proper types
      const paymentData = {
        order_id: orderId,
        amount: Number(order.data_amount),
        currency: "usd",
        payment_method: validatedData.data.paymentMethod,
        status: "pending" as const,
        payment_date: new Date(),
        storeId,
      };

      const newPayment = await PaymentRepository.create(paymentData); // Process payment with Stripe
      try {
        const stripe = await import("@/lib/stripe/stripe.config");

        // ✅ FIX: Get or create Stripe Customer for user
        let stripeCustomerId = order.user?.stripeCustomerId;

        if (!stripeCustomerId) {
          // Create new Stripe Customer if user doesn't have one
          const customer = await stripe.default.customers.create({
            email: order.user?.email || `user-${appUserId}@example.com`,
            metadata: {
              appUserId: appUserId,
              storeId: storeId,
            },
          });

          stripeCustomerId = customer.id;
          // Save Stripe Customer ID to user record
          await UserRepository.update(appUserId, { stripeCustomerId });
          console.log(
            `Created Stripe Customer ${stripeCustomerId} for user ${appUserId}`,
          );
        }

        // ✅ FIX: Attach PaymentMethod to Customer (makes it reusable)
        await stripe.default.paymentMethods.attach(
          validatedData.data.paymentToken,
          {
            customer: stripeCustomerId,
          },
        );

        // Create payment intent with Stripe - Mobile-compatible configuration
        const paymentIntent = await stripe.default.paymentIntents.create({
          amount: Math.round(Number(order.data_amount) * 100), // Convert to cents
          currency: "usd",
          customer: stripeCustomerId, // ✅ FIX: Critical - Customer attachment
          payment_method: validatedData.data.paymentToken, // ✅ Use required token from client
          confirm: true,
          // ✅ FIX: Mobile-compatible configuration
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never", // Prevent redirects for mobile apps
          },
          metadata: {
            orderId: orderId,
            storeId: storeId,
            appUserId: appUserId,
          },
        });

        if (paymentIntent.status === "succeeded") {
          // Update payment with Stripe details
          await PaymentRepository.updateStatus(newPayment.id, "succeeded");
          await PaymentRepository.updateStripeDetails(
            newPayment.id,
            paymentIntent.id,
            paymentIntent.client_secret || undefined,
          );
          await OrderRepository.updatePaymentStatus(orderId, "paid");
        } else {
          // Payment requires additional action (like 3D Secure)
          await PaymentRepository.updateStatus(
            newPayment.id,
            "requires_action",
          );
          return c.json({
            status: "requires_action",
            message: "Additional authentication required",
            data: {
              paymentId: newPayment.id,
              paymentIntentId: paymentIntent.id,
              clientSecret: paymentIntent.client_secret,
            },
          });
        }
      } catch (stripeError) {
        console.error("Stripe payment failed:", stripeError);
        await PaymentRepository.updateStatus(newPayment.id, "failed");
        return c.json(
          {
            status: "error",
            message: "Payment processing failed",
          },
          400,
        );
      }

      return c.json({
        status: "success",
        message: "Payment processed successfully",
        data: {
          paymentId: newPayment.id,
          orderId: orderId,
          amount: Number(order.data_amount),
          status: "succeeded",
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
  }
}
