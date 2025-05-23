# StoreGo Stripe Integration Implementation Plan

## Overview

This document outlines the comprehensive plan for integrating Stripe payments into the StoreGo platform, covering both the server-side (Next.js/Hono) implementation and the client-side (Generated Flutter Apps) integration.

## Current State Analysis

### ✅ What's Already Implemented

#### Server-Side (StoreGo Platform)

- Payment controller with basic structure
- Payment repository framework
- Database schema for payments and payment methods
- Order management system (fully working)
- Multi-tenant architecture with proper user context

#### Generated Flutter Apps

- Authentication system using Supabase
- Store-specific user validation
- Order creation capabilities
- Cart management functionality

### ❌ Critical Issues to Fix

1. **Payment Controller User Context Bug**

   ```typescript
   // Current (BROKEN)
   const { userId } = c.get("user");

   // Should be (FIXED)
   const { id: appUserId, storeId } = c.get("user");
   ```

2. **Missing Payment Repository Methods**
3. **No Webhook Implementation**
4. **Missing Payment Method Management**

## Implementation Plan

### Phase 1: Server-Side Stripe Integration (StoreGo Platform)

#### 1.1 Fix Payment Controller User Context

**Priority**: 🔴 Critical
**Estimated Time**: 2 hours

```typescript
// Fix all payment controller methods to use correct user context
static async processPayment(c: Context) {
  const { id: appUserId, storeId } = c.get("user"); // ✅ Correct
  // ...rest of implementation
}
```

#### 1.2 Implement Missing Payment Repository Methods

**Priority**: 🔴 Critical  
**Estimated Time**: 4 hours

Required methods:

```typescript
class PaymentRepository {
  static async create(paymentData: PaymentCreateData);
  static async findByIdAndVerifyUser(
    paymentId: string,
    appUserId: string,
    storeId: string,
  );
  static async findAllByUser(appUserId: string, storeId: string);
  static async updateStatus(paymentId: string, status: string);
  static async verifyOrderOwnership(
    orderId: string,
    appUserId: string,
    storeId: string,
  );
}
```

#### 1.3 Create Payment Method Management

**Priority**: 🔴 Critical
**Estimated Time**: 6 hours

Endpoints needed:

```typescript
GET    /api/mobile-app/payments/methods          // List saved payment methods
POST   /api/mobile-app/payments/methods          // Save new payment method
DELETE /api/mobile-app/payments/methods/[id]     // Delete payment method
PUT    /api/mobile-app/payments/methods/[id]/default // Set default payment method
```

#### 1.4 Implement Stripe Webhooks

**Priority**: 🔴 Critical
**Estimated Time**: 4 hours

```typescript
POST / api / webhooks / stripe; // Handle Stripe events
// Events to handle:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_method.attached
// - customer.source.created
```

#### 1.5 Order-Payment Integration

**Priority**: 🟡 High
**Estimated Time**: 3 hours

```typescript
POST / api / mobile - app / orders / [orderId] / pay; // Pay for specific order
GET / api / mobile - app / orders / [orderId] / payment - status; // Check payment status
```

### Phase 2: Environment Configuration

#### 2.1 Server-Side Environment Variables

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Authentication
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
```

#### 2.2 Generated App Environment Configuration

**Location**: Generated in Flutter app during GitHub Actions

```dart
// lib/config/stripe_config.dart (Generated)
class StripeConfig {
  static const String publishableKey = 'pk_test_...'; // From store config
  static const String merchantIdentifier = 'merchant.com.storego.{{store_id}}';
  static const String apiBaseUrl = 'https://store-go.vercel.app'; // StoreGo API
}
```

### Phase 3: Generated Flutter App Integration

#### 3.1 Flutter Dependencies (Template)

**Location**: `pubspec.yaml` template

```yaml
dependencies:
  # ...existing dependencies...
  flutter_stripe: ^10.1.1
  http: ^1.1.0
  get: ^4.6.6 # Already included for state management
```

#### 3.2 Stripe Initialization (Template)

**Location**: `lib/services/stripe_service.dart` template

```dart
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import '../config/stripe_config.dart';

class StripeService extends GetxService {
  @override
  Future<void> onInit() async {
    super.onInit();
    await _initializeStripe();
  }

  Future<void> _initializeStripe() async {
    Stripe.publishableKey = StripeConfig.publishableKey;
    Stripe.merchantIdentifier = StripeConfig.merchantIdentifier;
    await Stripe.instance.applySettings();
  }

  // Payment method creation
  Future<PaymentMethod> createPaymentMethod({
    required CardFieldInputDetails cardDetails,
    BillingDetails? billingDetails,
  }) async {
    final paymentMethod = await Stripe.instance.createPaymentMethod(
      params: PaymentMethodParams.card(
        paymentMethodData: PaymentMethodData(
          billingDetails: billingDetails,
        ),
        card: CardParams(
          number: cardDetails.cardNumber,
          cvc: cardDetails.cvc,
          expirationMonth: cardDetails.expiryDate?.month,
          expirationYear: cardDetails.expiryDate?.year,
        ),
      ),
    );
    return paymentMethod;
  }

  // Process payment through StoreGo API
  Future<Map<String, dynamic>> processPayment({
    required String orderId,
    required String paymentMethodId,
    required double amount,
    String currency = 'usd',
  }) async {
    final authService = Get.find<AuthService>();
    final token = await authService.getToken();

    final response = await http.post(
      Uri.parse('${StripeConfig.apiBaseUrl}/api/mobile-app/orders/$orderId/pay'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
        'Idempotency-Key': 'order-$orderId-${DateTime.now().millisecondsSinceEpoch}',
      },
      body: jsonEncode({
        'paymentMethodId': paymentMethodId,
        'amount': amount,
        'currency': currency,
      }),
    );

    final result = jsonDecode(response.body);

    // Handle 3D Secure if required
    if (result['status'] == 'requires_action') {
      await Stripe.instance.handleNextAction(result['data']['clientSecret']);
      return await _checkPaymentStatus(result['data']['paymentIntentId']);
    }

    return result;
  }

  Future<Map<String, dynamic>> _checkPaymentStatus(String paymentIntentId) async {
    // Implementation for checking payment status after 3D Secure
    // ...
  }
}
```

#### 3.3 Payment UI Templates

**Location**: `lib/screens/checkout/` template folder

```dart
// lib/screens/checkout/payment_screen.dart (Template)
class PaymentScreen extends StatelessWidget {
  final String orderId;
  final double amount;

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentController>(
      builder: (controller) => Scaffold(
        appBar: AppBar(title: Text('Payment')),
        body: Column(
          children: [
            // Order summary
            OrderSummaryCard(orderId: orderId, amount: amount),

            // Payment form
            CardField(
              onCardChanged: controller.onCardChanged,
            ),

            // Payment button
            ElevatedButton(
              onPressed: controller.isCardComplete
                ? () => controller.processPayment(orderId, amount)
                : null,
              child: Text('Pay \$${amount.toStringAsFixed(2)}'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### 3.4 Payment Controller Template

**Location**: `lib/controllers/payment_controller.dart` template

```dart
class PaymentController extends GetxController {
  final StripeService _stripeService = Get.find<StripeService>();

  CardFieldInputDetails? _cardDetails;
  bool get isCardComplete => _cardDetails?.complete ?? false;

  final RxBool _isProcessing = false.obs;
  bool get isProcessing => _isProcessing.value;

  void onCardChanged(CardFieldInputDetails? details) {
    _cardDetails = details;
    update();
  }

  Future<void> processPayment(String orderId, double amount) async {
    if (_cardDetails == null || !_cardDetails!.complete) {
      Get.snackbar('Error', 'Please enter complete card information');
      return;
    }

    _isProcessing.value = true;

    try {
      // Create payment method
      final paymentMethod = await _stripeService.createPaymentMethod(
        cardDetails: _cardDetails!,
      );

      // Process payment
      final result = await _stripeService.processPayment(
        orderId: orderId,
        paymentMethodId: paymentMethod.id,
        amount: amount,
      );

      if (result['status'] == 'success') {
        Get.offAll(() => PaymentSuccessScreen(orderId: orderId));
      } else {
        Get.snackbar('Payment Failed', result['message'] ?? 'Unknown error');
      }
    } catch (e) {
      Get.snackbar('Error', e.toString());
    } finally {
      _isProcessing.value = false;
    }
  }
}
```

### Phase 4: Code Generation Integration

#### 4.1 Template Structure Updates
