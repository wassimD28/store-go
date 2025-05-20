import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

// Check if the key is provided
if (!stripeSecretKey) {
  console.warn(
    "Warning: STRIPE_SECRET_KEY is not defined in environment variables",
  );
}

// Verify we're in test mode
const isTestMode = stripeSecretKey.startsWith("sk_test_");
if (!isTestMode && process.env.NODE_ENV !== "production") {
  console.warn(
    "Warning: You are not using a Stripe test key (sk_test_). Ensure this is intentional.",
  );
}

// Initialize the Stripe client
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil", // Use the latest API version
});

// Export both the Stripe instance and the mode information
export default stripe;
export const stripeMode = isTestMode ? "test" : "live";
