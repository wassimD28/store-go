import { betterAuth } from "better-auth";
import { db } from "./db/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendEmail } from "./sendEmail";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationURL = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      await sendEmail({
        to: user.email,
        subject: "Store-go Verification",
        htmlContent: `
          <h1>Verify your email</h1>
          <p>To complete your registration, please click the following link:</p>
          <a href="${verificationURL}">Verify Email</a>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
