import { z } from "zod";

export const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().min(0, "Amount must be a positive number"),
  payment_date: z.date().optional().default(() => new Date()),
  payment_method: z.enum(["credit_card", "debit_card", "paypal", "apple_pay", "google_pay", "bank_transfer"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending")
});

export const updatePaymentSchema = createPaymentSchema.partial();