/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppPayment, AppOrder, AppPaymentMethod } from "@/lib/db/schema";
import {
  createPaymentSchema,
  updatePaymentSchema,
} from "../schemas/payment.schema";
import { z } from "zod";

type PaymentCreateData = z.infer<typeof createPaymentSchema>;
type PaymentUpdateData = z.infer<typeof updatePaymentSchema>;

// Fix: Add proper payment method types based on actual schema
type PaymentMethodCreateData = {
  storeId: string;
  appUserId: string;
  type:
    | "credit_card"
    | "debit_card"
    | "paypal"
    | "apple_pay"
    | "google_pay"
    | "bank_transfer";
  stripePaymentMethodId: string;
  details: Record<string, any>;
  isDefault?: boolean;
};

export class PaymentRepository {
  // ========== PAYMENT PROCESSING METHODS ==========

  static async findAllByUser(appUserId: string, storeId: string) {
    try {
      // Fix: Join properly with correct field names
      const result = await db
        .select({
          payment: AppPayment,
          order: AppOrder,
        })
        .from(AppPayment)
        .innerJoin(AppOrder, eq(AppPayment.order_id, AppOrder.id))
        .where(
          and(
            eq(AppOrder.appUserId, appUserId), // Use correct field name
            eq(AppOrder.storeId, storeId),
          ),
        );

      // Return only payment data
      return result.map((row) => row.payment);
    } catch (error) {
      console.error("Error fetching payments for user:", error);
      throw new Error("Failed to fetch payments");
    }
  }

  static async findById(id: string) {
    try {
      return await db.query.AppPayment.findFirst({
        where: eq(AppPayment.id, id),
      });
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      throw new Error(`Failed to fetch payment with ID ${id}`);
    }
  }

  static async verifyOrderOwnership(
    orderId: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      const order = await db.query.AppOrder.findFirst({
        where: and(
          eq(AppOrder.id, orderId),
          eq(AppOrder.appUserId, appUserId), // Use correct field name
          eq(AppOrder.storeId, storeId),
        ),
      });
      return !!order;
    } catch (error) {
      console.error(`Error verifying order ownership:`, error);
      throw new Error("Failed to verify order ownership");
    }
  }

  static async findByIdAndVerifyUser(
    id: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      const payment = await this.findById(id);
      if (!payment) return null;

      const orderBelongsToUser = await this.verifyOrderOwnership(
        payment.order_id,
        appUserId,
        storeId,
      );
      if (!orderBelongsToUser) return null;

      return payment;
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      throw new Error(`Failed to fetch payment with ID ${id}`);
    }
  }

  static async create(paymentData: PaymentCreateData & { storeId: string }) {
    try {
      // ✅ Fixed: Ensure all required fields match schema exactly
      const [newPayment] = await db
        .insert(AppPayment)
        .values({
          storeId: paymentData.storeId,
          order_id: paymentData.order_id,
          amount: String(paymentData.amount), // Convert to string for decimal
          currency: paymentData.currency || "usd", // ✅ Required field
          payment_method: paymentData.payment_method,
          status: paymentData.status || "pending", // ✅ Use enum values
          payment_date: paymentData.payment_date || new Date(),
          // Optional fields
          stripePaymentIntentId: paymentData.stripePaymentIntentId || null,
          clientSecret: paymentData.clientSecret || null,
          errorMessage: null,
          errorCode: null,
          idempotencyKey: paymentData.idempotencyKey || null,
        })
        .returning();
      return newPayment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment");
    }
  }
  static async updateStatus(
    paymentId: string,
    status:
      | "pending"
      | "processing"
      | "paid"
      | "failed"
      | "canceled"
      | "requires_action"
      | "requires_payment_method", // ✅ Fixed: Use proper enum type
    errorMessage?: string,
    errorCode?: string,
  ) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      if (errorMessage) updateData.errorMessage = errorMessage;
      if (errorCode) updateData.errorCode = errorCode;

      const [updatedPayment] = await db
        .update(AppPayment)
        .set(updateData)
        .where(eq(AppPayment.id, paymentId))
        .returning();
      return updatedPayment;
    } catch (error) {
      console.error(`Error updating payment status:`, error);
      throw new Error("Failed to update payment status");
    }
  }

  static async updateStripeDetails(
    paymentId: string,
    stripePaymentIntentId: string,
    clientSecret?: string,
  ) {
    try {
      const updateData: any = {
        stripePaymentIntentId,
        updated_at: new Date(),
      };

      if (clientSecret) updateData.clientSecret = clientSecret;

      const [updatedPayment] = await db
        .update(AppPayment)
        .set(updateData)
        .where(eq(AppPayment.id, paymentId))
        .returning();
      return updatedPayment;
    } catch (error) {
      console.error(`Error updating payment Stripe details:`, error);
      throw new Error("Failed to update payment Stripe details");
    }
  }

  // ========== PAYMENT METHODS MANAGEMENT ==========

  static async createPaymentMethod(data: PaymentMethodCreateData) {
    try {
      // If this is set as default, remove default from other payment methods
      if (data.isDefault) {
        await this.removeDefaultFromOtherMethods(data.appUserId, data.storeId);
      }

      const [newPaymentMethod] = await db
        .insert(AppPaymentMethod)
        .values({
          storeId: data.storeId,
          appUserId: data.appUserId,
          type: data.type,
          stripePaymentMethodId: data.stripePaymentMethodId,
          details: data.details,
          isDefault: data.isDefault || false,
        })
        .returning();

      return newPaymentMethod;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw new Error("Failed to create payment method");
    }
  }

  static async findPaymentMethodsByUser(appUserId: string, storeId: string) {
    try {
      return await db.query.AppPaymentMethod.findMany({
        where: and(
          eq(AppPaymentMethod.appUserId, appUserId),
          eq(AppPaymentMethod.storeId, storeId),
        ),
        orderBy: (paymentMethod, { desc }) => [
          desc(paymentMethod.isDefault),
          desc(paymentMethod.createdAt),
        ],
      });
    } catch (error) {
      console.error("Error fetching payment methods for user:", error);
      throw new Error("Failed to fetch payment methods");
    }
  }

  static async findPaymentMethodById(
    id: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      return await db.query.AppPaymentMethod.findFirst({
        where: and(
          eq(AppPaymentMethod.id, id),
          eq(AppPaymentMethod.appUserId, appUserId),
          eq(AppPaymentMethod.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error(`Error fetching payment method with ID ${id}:`, error);
      throw new Error(`Failed to fetch payment method with ID ${id}`);
    }
  }

  static async setDefaultPaymentMethod(
    id: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      // First verify the payment method exists and belongs to user
      const paymentMethod = await this.findPaymentMethodById(
        id,
        appUserId,
        storeId,
      );
      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Remove default from all other payment methods
      await this.removeDefaultFromOtherMethods(appUserId, storeId);

      // Set this payment method as default
      const [updatedPaymentMethod] = await db
        .update(AppPaymentMethod)
        .set({
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(eq(AppPaymentMethod.id, id))
        .returning();

      return updatedPaymentMethod;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      throw new Error("Failed to set default payment method");
    }
  }

  static async deletePaymentMethod(
    id: string,
    appUserId: string,
    storeId: string,
  ) {
    try {
      // First verify the payment method exists and belongs to user
      const paymentMethod = await this.findPaymentMethodById(
        id,
        appUserId,
        storeId,
      );
      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Delete the payment method
      await db.delete(AppPaymentMethod).where(eq(AppPaymentMethod.id, id));

      return true;
    } catch (error) {
      console.error(`Error deleting payment method with ID ${id}:`, error);
      throw new Error(`Failed to delete payment method with ID ${id}`);
    }
  }

  private static async removeDefaultFromOtherMethods(
    appUserId: string,
    storeId: string,
  ) {
    try {
      await db
        .update(AppPaymentMethod)
        .set({
          isDefault: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(AppPaymentMethod.appUserId, appUserId),
            eq(AppPaymentMethod.storeId, storeId),
            eq(AppPaymentMethod.isDefault, true),
          ),
        );
    } catch (error) {
      console.error(
        "Error removing default from other payment methods:",
        error,
      );
      throw new Error("Failed to remove default from other payment methods");
    }
  }

  // ========== LEGACY METHODS (for backward compatibility) ==========

  static async update(id: string, paymentData: PaymentUpdateData) {
    try {
      const updateValues: Partial<typeof AppPayment.$inferInsert> = {};

      if (paymentData.amount !== undefined)
        updateValues.amount = String(paymentData.amount);
      if (paymentData.payment_date !== undefined)
        updateValues.payment_date = paymentData.payment_date;
      if (paymentData.payment_method !== undefined)
        updateValues.payment_method = paymentData.payment_method;
      if (paymentData.status !== undefined)
        updateValues.status = paymentData.status;

      updateValues.updated_at = new Date();

      const [updatedPayment] = await db
        .update(AppPayment)
        .set(updateValues)
        .where(eq(AppPayment.id, id))
        .returning();
      return updatedPayment;
    } catch (error) {
      console.error(`Error updating payment with ID ${id}:`, error);
      throw new Error(`Failed to update payment with ID ${id}`);
    }
  }

  static async delete(id: string) {
    try {
      await db.delete(AppPayment).where(eq(AppPayment.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting payment with ID ${id}:`, error);
      throw new Error(`Failed to delete payment with ID ${id}`);
    }
  }

  // Remove methods that were causing issues
  static async findAllByOrderId(orderId: string) {
    try {
      return await db.query.AppPayment.findMany({
        where: eq(AppPayment.order_id, orderId),
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw new Error("Failed to fetch payments");
    }
  }

  static async getDefaultPaymentMethod(appUserId: string, storeId: string) {
    try {
      return await db.query.AppPaymentMethod.findFirst({
        where: and(
          eq(AppPaymentMethod.appUserId, appUserId),
          eq(AppPaymentMethod.storeId, storeId),
          eq(AppPaymentMethod.isDefault, true),
        ),
      });
    } catch (error) {
      console.error("Error fetching default payment method:", error);
      throw new Error("Failed to fetch default payment method");
    }
  }

  static async findByStripePaymentIntentId(stripePaymentIntentId: string) {
    try {
      return await db.query.AppPayment.findFirst({
        where: eq(AppPayment.stripePaymentIntentId, stripePaymentIntentId),
      });
    } catch (error) {
      console.error("Error finding payment by Stripe ID:", error);
      throw new Error("Failed to find payment by Stripe ID");
    }
  }

  static async updateStripePaymentIntentId(
    paymentId: string,
    stripePaymentIntentId: string,
  ) {
    try {
      return await db
        .update(AppPayment)
        .set({
          stripePaymentIntentId,
          updated_at: new Date(),
        })
        .where(eq(AppPayment.id, paymentId))
        .returning();
    } catch (error) {
      console.error("Error updating Stripe payment intent ID:", error);
      throw new Error("Failed to update Stripe payment intent ID");
    }
  }
}
