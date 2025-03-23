import { Context } from "hono";
import { PaymentRepository } from "@/server/repositories/payment.repository";
import { idSchema } from "../schemas/common.schema";
import { createPaymentSchema, updatePaymentSchema } from "../schemas/payment.schema";

export class PaymentController {
  static async getAllPayments(c: Context) {
    try {
      const { userId } = c.get("user");
      // We need a method to get all payments related to a user
      // Since there's no direct findAll by userId method, we'll need to create one
      const payments = await PaymentRepository.findAllByUser(userId);
      return c.json({
        status: "success",
        data: payments
      });
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch payments"
      }, 500);
    }
  }

  static async getPaymentById(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      // Use the method that verifies user ownership
      const payment = await PaymentRepository.findByIdAndVerifyUser(id, userId);
      if (!payment) {
        return c.json({
          status: "error",
          message: "Payment not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: payment
      });
    } catch (error) {
      console.error("Error in getPaymentById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch payment"
      }, 500);
    }
  }

  static async createPayment(c: Context) {
    try {
      const { userId } = c.get("user");
      const body = await c.req.json();
      
      const paymentData = createPaymentSchema.safeParse({
        ...body,
        // This is not needed, as payments are linked to orders, not users directly
        // app_user_id: userId 
      });
      
      if (!paymentData.success) {
        return c.json({
          status: "error",
          message: "Invalid payment data",
          errors: paymentData.error.errors
        }, 400);
      }

      // Verify that the order belongs to the current user
      const orderBelongsToUser = await PaymentRepository.verifyOrderOwnership(paymentData.data.order_id, userId);
      if (!orderBelongsToUser) {
        return c.json({
          status: "error",
          message: "Order not found or does not belong to the current user"
        }, 403);
      }

      const newPayment = await PaymentRepository.create(paymentData.data);
      return c.json({
        status: "success",
        data: newPayment
      }, 201);
    } catch (error) {
      console.error("Error in createPayment:", error);
      return c.json({
        status: "error",
        message: "Failed to create payment"
      }, 500);
    }
  }

  static async updatePayment(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      const body = await c.req.json();
      
      const paymentData = updatePaymentSchema.safeParse(body);
      if (!paymentData.success) {
        return c.json({
          status: "error",
          message: "Invalid payment data",
          errors: paymentData.error.errors
        }, 400);
      }

      // Verify payment ownership
      const existingPayment = await PaymentRepository.findByIdAndVerifyUser(id, userId);
      if (!existingPayment) {
        return c.json({
          status: "error",
          message: "Payment not found or does not belong to the current user"
        }, 404);
      }

      const updatedPayment = await PaymentRepository.update(id, paymentData.data);
      return c.json({
        status: "success",
        data: updatedPayment
      });
    } catch (error) {
      console.error("Error in updatePayment:", error);
      return c.json({
        status: "error",
        message: "Failed to update payment"
      }, 500);
    }
  }

  static async deletePayment(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      
      // Verify payment ownership
      const existingPayment = await PaymentRepository.findByIdAndVerifyUser(id, userId);
      if (!existingPayment) {
        return c.json({
          status: "error",
          message: "Payment not found or does not belong to the current user"
        }, 404);
      }

      await PaymentRepository.delete(id);
      return c.json({
        status: "success",
        message: "Payment deleted successfully"
      });
    } catch (error) {
      console.error("Error in deletePayment:", error);
      return c.json({
        status: "error",
        message: "Failed to delete payment"
      }, 500);
    }
  }
}