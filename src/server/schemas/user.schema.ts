import { z } from "zod";

export const userSchema = {
  create: z.object({
    name: z
      .string()
      .min(1, "User name is required")
      .max(100, "User name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "User email is required")
      .max(100, "User email must be less than 100 characters")
      .trim(),
  }),

  update: z.object({
    id: z.string().min(1, "User ID is required"),
    name: z
      .string()
      .min(1, "User name is required")
      .max(100, "User name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "User email is required")
      .max(100, "User email must be less than 100 characters")
      .trim(),
  }),
};
