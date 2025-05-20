import { stripeMode } from "./stripe.config";

/**
 * Utility functions for working with Stripe
 */

/**
 * Checks if Stripe is configured in test mode
 * @returns boolean indicating if Stripe is in test mode
 */
export const isStripeTestMode = (): boolean => {
  return stripeMode === "test";
};

/**
 * Logs Stripe test mode status to console
 * Useful for debugging and verifying environment
 */
export const logStripeMode = (): void => {
  console.log(`Stripe is running in ${stripeMode.toUpperCase()} mode`);

  if (stripeMode === "test") {
    console.log("✅ Using Stripe test mode - No real charges will be made");
  } else {
    console.log(
      "⚠️ WARNING: Using Stripe LIVE mode - REAL CHARGES WILL BE MADE",
    );
  }
};

/**
 * Returns an array of test card numbers for testing various scenarios
 * @returns Array of test card objects with description and number
 */
export const getStripeTestCards = () => {
  if (stripeMode !== "test") {
    throw new Error("Test cards should only be used in test mode");
  }

  return [
    { description: "Successful payment", number: "4242 4242 4242 4242" },
    {
      description: "Requires authentication (3D Secure)",
      number: "4000 0025 0000 3155",
    },
    { description: "Declined payment", number: "4000 0000 0000 9995" },
    { description: "Insufficient funds", number: "4000 0000 0000 9995" },
    { description: "Lost card", number: "4000 0000 0000 9987" },
    { description: "Expired card", number: "4000 0000 0000 0069" },
    { description: "Incorrect CVC", number: "4000 0000 0000 0127" },
  ];
};

/**
 * Check if a payment needs additional authentication (3D Secure)
 * @param paymentIntentStatus - The status from Stripe payment intent
 * @returns boolean indicating if additional authentication is needed
 */
export const needsAdditionalAuthentication = (
  paymentIntentStatus: string,
): boolean => {
  return (
    paymentIntentStatus === "requires_action" ||
    paymentIntentStatus === "requires_source_action"
  );
};
