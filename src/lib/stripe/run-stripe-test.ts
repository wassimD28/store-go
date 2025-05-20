import { spawn } from "child_process";
import open from "open";
import dotenv from "dotenv";
import { stripeMode } from "./stripe.config";

// Load environment variables
dotenv.config();

// Define URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const testPageUrl = `${baseUrl}/stripe-test.html`;

async function main() {
  console.log("==== STRIPE TEST PAYMENT RUNNER ====");

  // Verify we're in test mode
  if (stripeMode !== "test") {
    console.error(
      "❌ Error: Stripe is not in test mode! This script should only be used with test keys.",
    );
    process.exit(1);
  }

  console.log("✅ Stripe test mode confirmed");
  console.log("Starting Next.js development server...");

  // Start the Next.js development server
  const nextProcess = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    shell: true,
  });

  // Listen for server termination
  nextProcess.on("close", (code) => {
    console.log(`Next.js server process exited with code ${code}`);
  });

  // Wait a bit for the server to start
  setTimeout(async () => {
    console.log(`Opening test page: ${testPageUrl}`);
    await open(testPageUrl);
    console.log(
      "\nTest server running. Press Ctrl+C to stop the server when done testing.\n",
    );
  }, 5000);

  // Handle script termination
  process.on("SIGINT", () => {
    console.log("\nShutting down test server...");
    nextProcess.kill();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Failed to run test:", error);
  process.exit(1);
});
