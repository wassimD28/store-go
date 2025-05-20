import { z } from "zod";

export const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().min(0, "Amount must be a positive number"),
  payment_date: z.date().optional().default(() => new Date()),
  payment_method: z.string().min(1, "Payment method is required"),
  status: z.string().min(1, "Status is required").default("pending")
});

export const updatePaymentSchema = createPaymentSchema.partial();