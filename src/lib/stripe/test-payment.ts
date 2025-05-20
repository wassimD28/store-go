import stripe, { stripeMode } from './stripe.config';
import { logStripeMode } from './stripe.utils';

/**
 * Simple script to test Stripe payment processing
 * Run with: npm run stripe:test-payment
 */

// Type for the result of our payment test
interface PaymentTestResult {
  customerId: string;
  paymentMethodId: string;
  paymentIntentId: string;
  status: string;
}

async function main(): Promise<PaymentTestResult> {
  console.log('==== STRIPE PAYMENT TEST ====');
  
  // Log the current mode
  logStripeMode();
  
  // Ensure we're in test mode
  if (stripeMode !== 'test') {
    console.error(' Error: This script should only be run in test mode!');
    process.exit(1);
  }
  
  try {
    // Step 1: Create a test customer
    console.log('\n Step 1: Creating a test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        createdBy: 'test-script',
      },
    });
    console.log(' Created test customer: ');
    
    // Step 2: Create a payment method
    console.log('\n Step 2: Creating a test payment method...');
    // Use a different approach with tokenized cards
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Test token representing a Visa card
      },
    });
    console.log(' Created test payment method: ');
    
    // Step 3: Attach payment method to customer
    console.log('\n Step 3: Attaching payment method to customer...');
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    console.log(' Payment method attached to customer');
    
    // Step 4: Create a payment intent
    console.log('\n Step 4: Creating a payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // .00
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethod.id,
      description: 'Test payment from StoreGo',
      metadata: {
        testPayment: 'true',
        orderNumber: 'TEST-' + Math.floor(Math.random() * 1000000),
      },
      // For testing, we'll confirm the payment immediately
      confirm: true,
    });
    console.log(`Created payment intent:`);
    console.log(` Amount: stripe:test-payment ${paymentIntent.amount / 100}`);
    console.log(' Status: ');
    
    // Step 5: Verify payment was successful
    if (paymentIntent.status === 'succeeded') {
      console.log('\n SUCCESS! Payment completed successfully');
    } else {
      console.log(
        '\n Payment needs additional action. Status: '
      );
      if (paymentIntent.next_action) {
        console.log(
          'Additional action required: ',
          JSON.stringify(paymentIntent.next_action, null, 2)
        );
      }
    }
    
    // Step 6: Retrieve the payment intent to double-check
    console.log('\n Step 6: Retrieving payment intent to verify status...');
    const retrievedIntent = await stripe.paymentIntents.retrieve(
      paymentIntent.id
    );
    console.log('Final payment status: ');
    
    return {
      customerId: customer.id,
      paymentMethodId: paymentMethod.id,
      paymentIntentId: paymentIntent.id,
      status: retrievedIntent.status,
    };
  } catch (err) {
    // Handle specific Stripe errors
    const error = err as Error & {
      type?: string;
      code?: string;
      decline_code?: string;
    };
    
    console.error(' Error in payment test:', error.message || 'Unknown error');
    
    if (error.type === 'StripeCardError') {
      console.error('Card was declined:', error.message);
    }
    
    throw error;
  }
}

// Run the test
main()
  .then((result) => {
    console.log('\n==== TEST COMPLETE ====');
    console.log('Test Result:', result);
    console.log('\nYou can view this payment in your Stripe dashboard:');
    console.log('https://dashboard.stripe.com/test/payments');
  })
  .catch((error) => {
    console.error('\n==== TEST FAILED ====');
    console.error('Error:', error);
    process.exit(1);
  });

