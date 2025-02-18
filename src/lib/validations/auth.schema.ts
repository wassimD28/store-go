import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email("Invalid email address"),
  password: z
    .string()
    .nonempty({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  name: z
    .string()
    .nonempty({ message: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
});

export const signInSchema = signUpSchema.pick({
  email: true,
  password: true,
});

