import { db } from "@/lib/db/db";
import { eq, and, desc } from "drizzle-orm";
import { AppOrder, OrderItem } from "@/lib/db/schema";
import { CartRepository } from "@/server/repositories/cart.repository";

// Define types based on actual database schema
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "paid"
  | "failed"
  | "canceled"
  | "refunded"
  | "requires_action"
  | "requires_payment_method";

type OrderCreateData = {
  appUserId: string;
  storeId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string; // Use postalCode to match database
    country: string;
    phone?: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string; // Use postalCode to match database
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  notes?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export class OrderRepository {
  // Create new order
  static async create(orderData: OrderCreateData) {
    try {
      // Calculate total from cart items (don't pass it in, calculate it)
      const cartResult = await CartRepository.findByUser(
        orderData.appUserId,
        orderData.storeId,
      );
      if (!cartResult || !cartResult.items.length) {
        throw new Error("Cannot create order: cart is empty");
      }

      const { summary } = cartResult;
      const taxRate = 0.1;
      const tax = Math.round(summary.subtotal * taxRate * 100) / 100;
      const shippingCost = summary.subtotal >= 50 ? 0 : 15.0;
      const totalAmount =
        Math.round((summary.subtotal + tax + shippingCost) * 100) / 100;
      const [newOrder] = await db
        .insert(AppOrder)
        .values({
          appUserId: orderData.appUserId,
          storeId: orderData.storeId,
          orderNumber: await this.generateOrderNumber(),
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress || orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes,
          status: (orderData.status || "pending") as OrderStatus,
          payment_status: (orderData.paymentStatus ||
            "pending") as PaymentStatus,
          data_amount: totalAmount.toString(),
        })
        .returning();

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async addOrderItems(orderId: string, cartItems: any[]) {
    try {
      const orderItems = cartItems.map((item) => ({
        orderId: orderId, // ✅ Ensure this matches schema
        productId: item.productId,
        quantity: item.quantity,
        unit_price: item.product.price.toString(), // Fix: Convert to string for decimal field
        total_price: (item.product.price * item.quantity).toString(), // Fix: Convert to string for decimal field
        variants: item.variants || {}, // Fix: Ensure variants is an object, not null
      }));

      return await db.insert(OrderItem).values(orderItems).returning();
    } catch (error) {
      console.error("Error adding order items:", error);
      throw new Error("Failed to add order items");
    }
  }

  static async findByUser(appUserId: string, storeId: string) {
    try {
      return await db.query.AppOrder.findMany({
        where: and(
          eq(AppOrder.appUserId, appUserId),
          eq(AppOrder.storeId, storeId),
        ),
        orderBy: [desc(AppOrder.created_at)],
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }
  static async findById(orderId: string, appUserId: string, storeId: string) {
    try {
      return await db.query.AppOrder.findFirst({
        where: and(
          eq(AppOrder.id, orderId),
          eq(AppOrder.appUserId, appUserId),
          eq(AppOrder.storeId, storeId),
        ),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          user: true, // ✅ Include user data for Stripe Customer management (relation name is 'user')
        },
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Failed to fetch order");
    }
  }

  // Method for webhooks that don't require user authentication
  static async findByIdWithoutUser(orderId: string) {
    try {
      return await db.query.AppOrder.findFirst({
        where: eq(AppOrder.id, orderId),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          user: true,
        },
      });
    } catch (error) {
      console.error("Error fetching order for webhook:", error);
      throw new Error("Failed to fetch order for webhook");
    }
  }
  static async updateStatus(orderId: string, status: OrderStatus) {
    try {
      return await db
        .update(AppOrder)
        .set({
          status: status,
          updated_at: new Date(),
        })
        .where(eq(AppOrder.id, orderId))
        .returning();
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }
  }
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ) {
    try {
      // ✅ Fixed: Use correct database field names
      return await db
        .update(AppOrder)
        .set({
          payment_status: paymentStatus, // Use snake_case field name
          updated_at: new Date(),
        })
        .where(eq(AppOrder.id, orderId))
        .returning();
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw new Error("Failed to update payment status");
    }
  }

  private static async generateOrderNumber(): Promise<string> {
    // Generate unique order number
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
