import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppPayment, AppOrder } from "@/lib/db/schema";
import { createPaymentSchema, updatePaymentSchema } from "../schemas/payment.schema";
import { z } from "zod";

type PaymentCreateData = z.infer<typeof createPaymentSchema>;
type PaymentUpdateData = z.infer<typeof updatePaymentSchema>;

export class PaymentRepository {
  // New method to find all payments associated with a user through their orders
  static async findAllByUser(userId: string) {
    try {
      // Join payment with order to get payments related to user's orders
      const result = await db.select()
        .from(AppPayment)
        .innerJoin(AppOrder, eq(AppPayment.order_id, AppOrder.id))
        .where(eq(AppOrder.appUserId, userId));
      
      // Format the result to return only the payment data
      return result.map(row => row.app_payment);
    } catch (error) {
      console.error("Error fetching payments for user:", error);
      throw new Error("Failed to fetch payments");
    }
  }
  
  // Find payments by order ID
  static async findAllByOrderId(orderId: string) {
    try {
      return await db.query.AppPayment.findMany({
        where: eq(AppPayment.order_id, orderId)
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw new Error("Failed to fetch payments");
    }
  }

  // Since payment doesn't have app_user_id, we need to get payments by ID only
  static async findById(id: string) {
    try {
      return await db.query.AppPayment.findFirst({
        where: eq(AppPayment.id, id)
      });
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      throw new Error(`Failed to fetch payment with ID ${id}`);
    }
  }

  // Verify that an order belongs to a specific user
  static async verifyOrderOwnership(orderId: string, userId: string) {
    try {
      const order = await db.query.AppOrder.findFirst({
        where: and(
          eq(AppOrder.id, orderId),
          eq(AppOrder.appUserId, userId)
        )
      });
      return !!order; // Return true if order exists and belongs to user
    } catch (error) {
      console.error(`Error verifying order ownership:`, error);
      throw new Error("Failed to verify order ownership");
    }
  }

  // Find a payment and verify it belongs to a user's order
  static async findByIdAndVerifyUser(id: string, userId: string) {
    try {
      // First get the payment
      const payment = await this.findById(id);
      if (!payment) return null;
      
      // Then verify that the order belongs to the user
      const orderBelongsToUser = await this.verifyOrderOwnership(payment.order_id, userId);
      if (!orderBelongsToUser) return null;
      
      return payment;
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      throw new Error(`Failed to fetch payment with ID ${id}`);
    }
  }

  static async create(paymentData: PaymentCreateData) {
    try {
      // Convert number to string for decimal fields
      const [newPayment] = await db.insert(AppPayment).values({
        order_id: paymentData.order_id,
        amount: String(paymentData.amount), // Convert to string for PostgreSQL decimal type
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        status: paymentData.status
      }).returning();
      return newPayment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment");
    }
  }

  static async update(id: string, paymentData: PaymentUpdateData) {
    try {
      const updateValues: Partial<typeof AppPayment.$inferInsert> = {};
      
      // Convert number to string for decimal fields
      if (paymentData.amount !== undefined) updateValues.amount = String(paymentData.amount);
      if (paymentData.payment_date !== undefined) updateValues.payment_date = paymentData.payment_date;
      if (paymentData.payment_method !== undefined) updateValues.payment_method = paymentData.payment_method;
      if (paymentData.status !== undefined) updateValues.status = paymentData.status;
      
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
}