// filepath: src/lib/stripe/check-payment.ts
import dotenv from "dotenv";
import stripe from "./stripe.config";

// Load environment variables
dotenv.config();

/**
 * Simple script to check a payment intent by ID
 * Usage: npx tsx -r dotenv/config src/lib/stripe/check-payment.ts pi_3RQnJXC7OEnDMw980Rzt75YM
 */
async function checkPayment() {
  try {
    // Get payment ID from command line argument
    const paymentIntentId = process.argv[2];

    if (!paymentIntentId) {
      console.error("❌ Please provide a payment intent ID as an argument");
      console.log(
        "\nUsage: npx tsx -r dotenv/config src/lib/stripe/check-payment.ts [PAYMENT_INTENT_ID]",
      );
      process.exit(1);
    }

    console.log(`🔍 Looking up payment intent: ${paymentIntentId}...`);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Format and display the payment details
    console.log("\n==== PAYMENT DETAILS ====\n");

    console.log(`Status: ${formatStatus(paymentIntent.status)}`);
    console.log(
      `Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`,
    );
    console.log(
      `Created: ${new Date(paymentIntent.created * 1000).toLocaleString()}`,
    );
    console.log(
      `Payment Method: ${paymentIntent.payment_method_types.join(", ")}`,
    );

    if (
      paymentIntent.metadata &&
      Object.keys(paymentIntent.metadata).length > 0
    ) {
      console.log("\nMetadata:");
      for (const [key, value] of Object.entries(paymentIntent.metadata)) {
        console.log(`  ${key}: ${value}`);
      }
    }

    console.log("\nFull Payment Intent Object:");
    console.log(JSON.stringify(paymentIntent, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error retrieving payment: ${error.message}`);
    } else {
      console.error("❌ Unknown error occurred");
    }
    process.exit(1);
  }
}

// Format the status with emoji
function formatStatus(status: string): string {
  const statusEmojis: Record<string, string> = {
    succeeded: "✅ succeeded",
    requires_payment_method: "⏳ requires_payment_method",
    requires_confirmation: "⏳ requires_confirmation",
    requires_action: "🔒 requires_action",
    processing: "⏳ processing",
    canceled: "❌ canceled",
    failed: "❌ failed",
  };

  return statusEmojis[status] || status;
}

// Run the function
checkPayment().catch((error) => {
  console.error("Failed to check payment:", error);
});
