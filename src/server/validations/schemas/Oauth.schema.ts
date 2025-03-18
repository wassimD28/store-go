import { z } from "zod";

// Schema for initiating OAuth flow
export const oauthProviderSchema = z.object({
  provider: z.enum(["google", "facebook", "twitter", "apple", "github"]),
  storeId: z.string().uuid(),
  redirectUrl: z.string().url()
});

// Schema for handling OAuth callback
export const oauthCallbackSchema = z.object({
  code: z.string(),
  storeId: z.string().uuid()
});

// Extend the existing sign-in schema to work with OAuth as well as password auth
export const appSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  storeId: z.string().uuid(),
  provider: z.enum(["google", "facebook", "twitter", "apple", "github"]).optional()
});

// Extend the existing sign-up schema to potentially include OAuth provider info
export const appSignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  storeId: z.string().uuid(),
  provider: z.enum(["google", "facebook", "twitter", "apple", "github"]).optional(),
  providerToken: z.string().optional()
});