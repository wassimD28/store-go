import { Context } from "hono";
import { OrderRepository } from "@/server/repositories/order.repository";
import { CartRepository } from "@/server/repositories/cart.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";

// Define request validation schema based on actual database fields
const createOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(), // Use postalCode to match database
    country: z.string(),
    phone: z.string().optional(),
  }),
  billingAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(), // Use postalCode to match database
      country: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
  paymentMethod: z.string(),
  paymentDetails: z
    .object({
      cardToken: z.string().optional(),
      last4: z.string().optional(),
    })
    .optional(),
  shippingMethod: z.string().optional(),
  notes: z.string().optional(),
});

export class OrderController {
  static async createOrder(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      // Validate request body
      const body = await c.req.json();
      const validationResult = createOrderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request data",
            errors: validationResult.error.format(),
          },
          400,
        );
      }

      const { shippingAddress, billingAddress, paymentMethod, notes } =
        validationResult.data;

      // Get user's cart
      const cartResult = await CartRepository.findByUser(appUserId, storeId);

      if (!cartResult || !cartResult.items.length) {
        return c.json(
          {
            status: "error",
            message: "Your cart is empty",
          },
          400,
        );
      }

      const { cart, items: cartItems } = cartResult;

      // Create order - let repository calculate the total
      const orderData = {
        appUserId,
        storeId,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        notes,
        status: "pending",
        paymentStatus: "pending",
      };

      const newOrder = await OrderRepository.create(orderData);

      // Add order items
      await OrderRepository.addOrderItems(newOrder.id, cartItems);

      // Convert cart to order
      await CartRepository.convertCartToOrder(cart.id);

      return c.json({
        status: "success",
        message: "Order created successfully",
        data: {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          totalAmount: Number(newOrder.data_amount),
          status: newOrder.status,
          paymentStatus: newOrder.payment_status, // Use correct field name
        },
      });
    } catch (error) {
      console.error("Error in createOrder:", error);
      return c.json(
        { status: "error", message: "Failed to create order" },
        500,
      );
    }
  }

  static async getUserOrders(c: Context) {
    try {
      const { id: appUserId, storeId } = c.get("user");

      const orders = await OrderRepository.findByUser(appUserId, storeId);

      // Format orders for response
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment_status, // Use correct field name
        totalAmount: Number(order.data_amount), // Use correct field name
        itemCount: order.items?.length || 0,
        created_at: order.created_at,
        updated_at: order.updated_at,
      }));

      return c.json({
        status: "success",
        data: formattedOrders,
      });
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return c.json(
        { status: "error", message: "Failed to fetch orders" },
        500,
      );
    }
  }

  static async getOrderById(c: Context) {
    try {
      const orderId = c.req.param("orderId");
      // check if order id is not empty or undefined and print it
      if (!orderId) {
        console.log("Order ID is empty or undefined, VALUE : ", orderId);
        return c.json(
          { status: "error", message: "Order ID is required" },
          400,
        );
      }
      const { id: appUserId, storeId } = c.get("user");

      const validId = idSchema.safeParse(orderId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid order ID" }, 400);
      }

      const order = await OrderRepository.findById(orderId, appUserId, storeId);

      if (!order) {
        return c.json({ status: "error", message: "Order not found" }, 404);
      }

      // Calculate totals dynamically from order items
      const itemsSubtotal =
        order.items?.reduce((sum, item) => {
          return sum + Number(item.unit_price) * item.quantity;
        }, 0) || 0;

      const tax = Math.round(itemsSubtotal * 0.1 * 100) / 100;
      const shippingCost = itemsSubtotal >= 50 ? 0 : 15.0;

      // Format order with calculated values
      const formattedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment_status, // Use correct field name
        subtotal: itemsSubtotal,
        tax: tax,
        shippingCost: shippingCost,
        totalAmount: Number(order.data_amount), // Use correct field name
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items:
          order.items?.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price), // Use correct field name
            totalPrice: Number(item.total_price), // Use correct field name
            variants: item.variants,
            product: {
              id: item.product?.id,
              name: item.product?.name,
              price: Number(item.product?.price),
              imageUrls: item.product?.image_urls || [],
            },
          })) || [],
      };

      return c.json({
        status: "success",
        data: formattedOrder,
      });
    } catch (error) {
      console.error("Error in getOrderById:", error);
      return c.json({ status: "error", message: "Failed to fetch order" }, 500);
    }
  }

  static async updateOrder(c: Context) {
    try {
      const orderId = c.req.param("orderId");
      const { id: appUserId, storeId } = c.get("user");

      const validId = idSchema.safeParse(orderId);
      if (!validId.success) {
        return c.json({ status: "error", message: "Invalid order ID" }, 400);
      }

      const body = await c.req.json();
      const { status } = body;

      if (!status) {
        return c.json({ status: "error", message: "Status is required" }, 400);
      }

      // Verify order exists and belongs to user
      const existingOrder = await OrderRepository.findById(
        orderId,
        appUserId,
        storeId,
      );
      if (!existingOrder) {
        return c.json({ status: "error", message: "Order not found" }, 404);
      }

      // Update order status
      await OrderRepository.updateStatus(orderId, status);

      return c.json({
        status: "success",
        message: "Order updated successfully",
      });
    } catch (error) {
      console.error("Error in updateOrder:", error);
      return c.json(
        { status: "error", message: "Failed to update order" },
        500,
      );
    }
  }
}
