import { z } from "zod";

const appSignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeId: z.string().uuid("Invalid store ID")
});
const appSignInSchema = appSignUpSchema.pick({
  email: true,
  password: true,
  storeId: true
});


export { appSignUpSchema, appSignInSchema };