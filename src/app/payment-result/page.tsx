// filepath: src/app/payment-result/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPaymentStatus() {
      try {
        // Get the payment_intent from the URL
        const paymentIntentId = searchParams.get("payment_intent");

        if (!paymentIntentId) {
          setPaymentStatus("missing");
          setLoading(false);
          return;
        }

        // Normally you would check with your backend here
        // For this test, we'll just display the ID and let you know it worked
        setPaymentStatus("success");
        setLoading(false);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPaymentStatus("error");
        setLoading(false);
      }
    }

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Processing Payment...</h1>
        <p className="mt-4 text-gray-600">
          Please wait while we verify your payment...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {paymentStatus === "success" && (
        <>
          <div className="mb-6 rounded-full bg-green-100 p-3">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-700">
            Payment Successful!
          </h1>
          <p className="mb-8 mt-4 text-center text-gray-600">
            Your payment has been processed successfully.
            <br />
            Payment ID: {searchParams.get("payment_intent")}
          </p>
        </>
      )}

      {paymentStatus === "error" && (
        <>
          <div className="mb-6 rounded-full bg-red-100 p-3">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-700">Payment Failed</h1>
          <p className="mb-8 mt-4 text-center text-gray-600">
            We couldn&apos;t process your payment.
            <br />
            Please try again or contact support if the issue persists.
          </p>
        </>
      )}

      {paymentStatus === "missing" && (
        <>
          <div className="mb-6 rounded-full bg-yellow-100 p-3">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-yellow-700">
            Missing Payment Information
          </h1>
          <p className="mb-8 mt-4 text-center text-gray-600">
            We couldn&apos;t find payment information in the URL.
            <br />
            Please return to the payment page and try again.
          </p>
        </>
      )}

      <div className="mt-8">
        <Link
          href="/stripe-test.html"
          className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
        >
          Return to Test Page
        </Link>
      </div>
    </div>
  );
}
