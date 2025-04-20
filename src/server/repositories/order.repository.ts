import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppOrder } from "@/lib/db/schema";
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema"; // Adjust this import path as needed
import { z } from "zod";

// Use Zod schemas to define the data types
type OrderCreateData = z.infer<typeof createOrderSchema>;
type OrderUpdateData = z.infer<typeof updateOrderSchema>;

export class OrderRepository {
  // Get all orders for a user
  static async findAll(userId: string) {
    try {
      const orders = await db.query.AppOrder.findMany({
        where: eq(AppOrder.appUserId, userId),
        with: {
          orderItems: true,
          address: true,
          payment: true,
        },
      });

      return orders;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  }

  // Get single order by ID for a specific user
  static async findById(id: string, userId: string) {
    try {
      const order = await db.query.AppOrder.findFirst({
        where: and(eq(AppOrder.id, id), eq(AppOrder.appUserId, userId)),
        with: {
          orderItems: true,
          address: true,
          payment: true,
        },
      });

      return order;
    } catch (error) {
      console.error(`Failed to fetch order with ID ${id}:`, error);
      throw error;
    }
  }

  // Create new order
  static async create(orderData: OrderCreateData) {
    try {
      // Convert number to string for data_amount
      const [newOrder] = await db
        .insert(AppOrder)
        .values({
          appUserId: orderData.appUserId,
          data_amount: String(orderData.data_amount),
          status: orderData.status,
          payment_status: orderData.payment_status,
          order_date: orderData.order_date,
          address_id: orderData.address_id || "",
          ...(orderData.paymentId && { paymentId: orderData.paymentId }),
        })
        .returning();

      return newOrder;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }

  // Update order
  static async update(id: string, orderData: OrderUpdateData) {
    try {
      // Prepare update data
      const updateValues = {
        ...(orderData.status && { status: orderData.status }),
        ...(orderData.payment_status && {
          payment_status: orderData.payment_status,
        }),
        ...(orderData.address_id !== undefined && {
          address_id: orderData.address_id,
        }),
        ...(orderData.paymentId !== undefined && {
          paymentId: orderData.paymentId,
        }),
        ...(orderData.data_amount !== undefined && {
          data_amount: String(orderData.data_amount),
        }),
      };

      const [updatedOrder] = await db
        .update(AppOrder)
        .set(updateValues)
        .where(eq(AppOrder.id, id))
        .returning();

      return updatedOrder;
    } catch (error) {
      console.error(`Failed to update order with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete order
  static async delete(id: string) {
    try {
      const [deletedOrder] = await db
        .delete(AppOrder)
        .where(eq(AppOrder.id, id))
        .returning();

      return deletedOrder;
    } catch (error) {
      console.error(`Failed to delete order with ID ${id}:`, error);
      throw error;
    }
  }

  // Optional: Get orders by status
  static async findByStatus(userId: string, status: string) {
    try {
      const orders = await db.query.AppOrder.findMany({
        where: and(eq(AppOrder.appUserId, userId), eq(AppOrder.status, status)),
        with: {
          orderItems: true,
          address: true,
          payment: true,
        },
      });

      return orders;
    } catch (error) {
      console.error(`Failed to fetch orders with status ${status}:`, error);
      throw error;
    }
  }

  // Optional: Get orders by payment status
  static async findByPaymentStatus(userId: string, paymentStatus: string) {
    try {
      const orders = await db.query.AppOrder.findMany({
        where: and(
          eq(AppOrder.appUserId, userId),
          eq(AppOrder.payment_status, paymentStatus),
        ),
        with: {
          orderItems: true,
          address: true,
          payment: true,
        },
      });

      return orders;
    } catch (error) {
      console.error(
        `Failed to fetch orders with payment status ${paymentStatus}:`,
        error,
      );
      throw error;
    }
  }
}
