import z from "zod";

export const createOrderSchema = z.object({
  appUserId: z.string(),
  order_date: z
    .date()
    .optional()
    .default(() => new Date()),
  data_amount: z.number().min(0),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .default("pending"),
  payment_status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "paid",
      "failed",
      "canceled",
      "refunded",
      "requires_action",
      "requires_payment_method",
    ])
    .default("pending"),
  address_id: z.string().optional(),
  paymentId: z.string().optional(),
});

export const updateOrderSchema = z.object({
  data_amount: z.number().min(0).optional(),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  payment_status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "paid",
      "failed",
      "canceled",
      "refunded",
      "requires_action",
      "requires_payment_method",
    ])
    .optional(),
  address_id: z.string().optional(),
  paymentId: z.string().optional(),
});
