import { z } from "zod";

export const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("usd"),
  payment_method: z.string(),
  status: z
    .enum([
      "pending",
      "processing",
      "succeeded",
      "failed",
      "canceled",
      "requires_action",
      "requires_payment_method",
    ])
    .optional()
    .default("pending"),
  payment_date: z.date().optional(),
  stripePaymentIntentId: z.string().optional(),
  clientSecret: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  payment_method: z.string().optional(),
  status: z
    .enum([
      "pending",
      "processing",
      "succeeded",
      "failed",
      "canceled",
      "requires_action",
      "requires_payment_method",
    ])
    .optional(),
  payment_date: z.date().optional(),
});

export const createPaymentMethodSchema = z.object({
  type: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "apple_pay",
    "google_pay",
    "bank_transfer",
  ]),
  stripePaymentMethodId: z.string(),
  isDefault: z.boolean().optional(),
  details: z
    .object({
      brand: z.string().optional(),
      last4: z.string().optional(),
      expiryMonth: z.string().optional(),
      expiryYear: z.string().optional(),
      cardholderName: z.string().optional(),
      email: z.string().optional(), // For PayPal
    })
    .optional(),
});
