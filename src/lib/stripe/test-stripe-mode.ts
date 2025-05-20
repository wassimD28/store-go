import stripe, { stripeMode } from "./stripe.config";
import { logStripeMode, getStripeTestCards } from "./stripe.utils";

/**
 * Simple script to verify Stripe mode
 * Run with: npx tsx src/lib/stripe/test-stripe-mode.ts
 */

async function main() {
  console.log("==== STRIPE MODE VERIFICATION ====");

  // Log the current mode
  logStripeMode();

  // Only show test cards in test mode
  if (stripeMode === "test") {
    console.log("\n==== STRIPE TEST CARDS ====");
    const testCards = getStripeTestCards();
    testCards.forEach((card) => {
      console.log(`- ${card.description}: ${card.number}`);
    });

    // Verify connection to Stripe API
    try {
      console.log("\n==== TESTING STRIPE API CONNECTION ====");
      const balance = await stripe.balance.retrieve();
      console.log("✅ Successfully connected to Stripe API");
      console.log(
        `Available balance: ${(balance.available[0]?.amount || 0) / 100} ${balance.available[0]?.currency.toUpperCase() || "USD"}`,
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      console.error("❌ Failed to connect to Stripe API:", error.message);
      console.error(
        "Check that your API key is valid and has the correct permissions.",
      );
    }
  }

  console.log("\n==== ENVIRONMENT VARIABLES ====");
  console.log(
    `STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? "✅ Set (starts with: " + process.env.STRIPE_SECRET_KEY.substring(0, 7) + "...)" : "❌ Not set"}`,
  );
  console.log(
    `STRIPE_PUBLISHABLE_KEY: ${process.env.STRIPE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Not set"}`,
  );
  console.log(
    `STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? "✅ Set" : "❌ Not set"}`,
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
