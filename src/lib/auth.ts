import { betterAuth } from "better-auth";
import { db } from "./db/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      //redirectURI: process.env.BETTER_AUTH_URL + "/api/auth/callback/google",
    },
  },
});
