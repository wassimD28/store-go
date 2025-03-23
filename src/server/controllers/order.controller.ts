import { Context } from "hono";
import { OrderRepository } from "@/server/repositories/order.repository";
import { idSchema } from "../schemas/common.schema";
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema";

export class OrderController {
  static async getAllOrders(c: Context) {
    try {
      const { userId } = c.get("user");
      const orders = await OrderRepository.findAll(userId);
      return c.json({
        status: "success",
        data: orders
      });
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch orders"
      }, 500);
    }
  }

  static async getOrderById(c: Context) {
    try {
      const id = c.req.param("id");
      // ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      const order = await OrderRepository.findById(id, userId);
      if (!order) {
        return c.json({
          status: "error",
          message: "Order not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: order
      });
    } catch (error) {
      console.error("Error in getOrderById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch order"
      }, 500);
    }
  }

  static async createOrder(c: Context) {
    try {
      const { userId } = c.get("user");
      const body = await c.req.json();
      
      // Validate order data
      const orderData = createOrderSchema.safeParse({ ...body, userId });
      if (!orderData.success) {
        return c.json({
          status: "error",
          message: "Invalid order data",
          errors: orderData.error.errors
        }, 400);
      }

      const newOrder = await OrderRepository.create(orderData.data);
      return c.json({
        status: "success",
        data: newOrder
      }, 201);
    } catch (error) {
      console.error("Error in createOrder:", error);
      return c.json({
        status: "error",
        message: "Failed to create order"
      }, 500);
    }
  }

  static async updateOrder(c: Context) {
    try {
      const id = c.req.param("id");
      // ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      const body = await c.req.json();
      
      // Validate order data
      const orderData = updateOrderSchema.safeParse(body);
      if (!orderData.success) {
        return c.json({
          status: "error",
          message: "Invalid order data",
          errors: orderData.error.errors
        }, 400);
      }

      // Check if order exists and belongs to user
      const existingOrder = await OrderRepository.findById(id, userId);
      if (!existingOrder) {
        return c.json({
          status: "error",
          message: "Order not found"
        }, 404);
      }

      const updatedOrder = await OrderRepository.update(id, orderData.data);
      return c.json({
        status: "success",
        data: updatedOrder
      });
    } catch (error) {
      console.error("Error in updateOrder:", error);
      return c.json({
        status: "error",
        message: "Failed to update order"
      }, 500);
    }
  }

  static async deleteOrder(c: Context) {
    try {
      const id = c.req.param("id");
      // ensure id is valid
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      
      // Check if order exists and belongs to user
      const existingOrder = await OrderRepository.findById(id, userId);
      if (!existingOrder) {
        return c.json({
          status: "error",
          message: "Order not found"
        }, 404);
      }

      await OrderRepository.delete(id);
      return c.json({
        status: "success",
        message: "Order deleted successfully"
      });
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      return c.json({
        status: "error",
        message: "Failed to delete order"
      }, 500);
    }
  }
}