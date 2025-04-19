// src/server/schemas/cart.schema.ts

import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().uuid(),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().int().positive(),
  variants: z.record(z.string()).optional(),
  image: z.string().optional(),
});