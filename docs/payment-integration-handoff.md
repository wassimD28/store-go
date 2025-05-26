# StoreGo Payment Integration Handoff Guide

## 📋 Overview

This document serves as a complete handoff guide for implementing Stripe payment functionality in the generated Flutter apps. It details what has been implemented on the server-side and exactly what needs to be built on the Flutter client-side.

---

## 🚀 Server-Side Implementation Status (COMPLETED)

### ✅ API Endpoints Ready for Flutter Integration

#### **Order Management**

```
POST   /api/mobile-app/orders              ✅ Create order from cart
GET    /api/mobile-app/orders              ✅ Get user orders
GET    /api/mobile-app/orders/{orderId}    ✅ Get order details
POST   /api/mobile-app/orders/{orderId}/pay ✅ Pay for order (MAIN PAYMENT ENDPOINT)
```

#### **Payment Methods Management**

```
GET    /api/mobile-app/payments/methods           ✅ Get saved payment methods
POST   /api/mobile-app/payments/methods           ✅ Save new payment method
DELETE /api/mobile-app/payments/methods/{id}     ✅ Delete payment method
PUT    /api/mobile-app/payments/methods/{id}/default ✅ Set default method
```

#### **Cart Integration**

```
GET    /api/mobile-app/cart/summary        ✅ Get cart summary with totals
POST   /api/mobile-app/cart/validate       ✅ Validate cart before checkout
```

#### **Webhooks & Background Processing**

```
POST   /api/webhooks/stripe                ✅ Handle Stripe events (payment success/failure)
```

### ✅ Stripe Integration Features

- **Real Payment Processing**: Using Stripe Payment Intents API ✅
- **3D Secure Authentication**: Automatic handling with client_secret return ✅
- **Multi-tenant Security**: Store isolation and user verification ✅
- **Error Handling**: Comprehensive error responses ✅
- **Payment Status Tracking**: Real-time status updates via webhooks ✅
- **Metadata Integration**: Order and user context in Stripe ✅

---

## 📱 Flutter Implementation Requirements

### 1. **Dependencies to Add**

```yaml
# pubspec.yaml
dependencies:
  flutter_stripe: ^10.1.1
  http: ^1.1.0
  get: ^4.6.6

dev_dependencies:
  json_annotation: ^4.8.1
  json_serializable: ^6.7.1
```

### 2. **Core Payment Flow Implementation**

#### **Step 1: Initialize Stripe in App**

```dart
// lib/services/stripe_service.dart
class StripeService extends GetxService {
  @override
  Future<void> onInit() async {
    super.onInit();

    // Set from your store configuration
    Stripe.publishableKey = AppConfig.stripePublishableKey;
    Stripe.merchantIdentifier = 'merchant.com.storego.${AppConfig.storeId}';
    await Stripe.instance.applySettings();
  }
}
```

#### **Step 2: Checkout Flow Implementation**

```dart
// lib/controllers/checkout_controller.dart
class CheckoutController extends GetxController {

  // Main checkout method - call this when user taps "Pay Now"
  Future<void> processCheckout() async {
    try {
      // 1. Create order from cart
      final orderResponse = await ApiService.post('/api/mobile-app/orders', {
        'shippingAddress': selectedShippingAddress.toJson(),
        'billingAddress': selectedBillingAddress.toJson(),
        'paymentMethod': 'credit_card',
        'notes': orderNotes,
      });

      final orderId = orderResponse['data']['orderId'];

      // 2. Create payment method
      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      // 3. Process payment
      await _processPayment(orderId, paymentMethod.id);

    } catch (e) {
      _handlePaymentError(e);
    }
  }

  Future<void> _processPayment(String orderId, String paymentMethodId) async {
    final response = await ApiService.post(
      '/api/mobile-app/orders/$orderId/pay',
      {
        'paymentMethod': 'credit_card',
        'paymentToken': paymentMethodId,
        'savePaymentMethod': false,
      },
    );

    if (response['status'] == 'requires_action') {
      // Handle 3D Secure authentication
      await _handle3DSecure(response['data']['clientSecret']);
    } else if (response['status'] == 'success') {
      // Payment successful - navigate to success page
      Get.offAll(() => PaymentSuccessScreen(orderId: orderId));
    }
  }

  Future<void> _handle3DSecure(String clientSecret) async {
    final result = await Stripe.instance.handleNextAction(clientSecret);
    if (result.status == PaymentIntentsStatus.Succeeded) {
      // Payment completed after 3D Secure
      Get.offAll(() => PaymentSuccessScreen());
    } else {
      throw Exception('3D Secure authentication failed');
    }
  }
}
```

### 3. **Required UI Screens**

#### **Checkout Screen**

- Order summary display
- Address selection/input
- Payment method input (using CardField widget)
- "Pay Now" button that triggers checkout flow

#### **Payment Processing Screen**

- Loading indicator
- 3D Secure authentication handling
- Error display

#### **Payment Success/Failure Screens**

- Success confirmation with order number
- Failure screen with retry option

### 4. **API Service Implementation**

```dart
// lib/services/api_service.dart
class ApiService {
  static const String baseUrl = 'https://store-go.vercel.app';

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    final token = await AuthService.getToken();

    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw ApiException.fromResponse(response);
    }
  }
}
```

---

## 🔧 Server-Side Payment Endpoint Details

### Primary Payment Endpoint: `POST /api/mobile-app/orders/{orderId}/pay`

**Request Body:**

```json
{
  "paymentMethod": "credit_card",
  "paymentToken": "pm_1234567890", // Stripe payment method ID from Flutter
  "savePaymentMethod": false
}
```

**Successful Response:**

```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "amount": 125.99,
    "status": "succeeded"
  }
}
```

**3D Secure Response:**

```json
{
  "status": "requires_action",
  "message": "Additional authentication required",
  "data": {
    "paymentId": "uuid",
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abc123"
  }
}
```

### Error Handling

The server returns detailed error messages for:

- Invalid order ID
- Order already paid
- Payment processing failures
- Stripe API errors

---

## 🎯 Implementation Priority

### Phase 1: Basic Payment Flow (HIGH PRIORITY)

1. ✅ Stripe initialization in app
2. ✅ Basic checkout screen with CardField
3. ✅ Order creation and payment processing
4. ✅ Success/failure screens

### Phase 2: Enhanced Features (MEDIUM PRIORITY)

1. ✅ Saved payment methods management
2. ✅ 3D Secure authentication handling
3. ✅ Payment history screen
4. ✅ Error recovery flows

### Phase 3: Advanced Features (LOW PRIORITY)

1. ✅ Payment method validation
2. ✅ Offline payment queuing
3. ✅ Payment analytics
4. ✅ Refund handling

---

## 🔒 Security & Configuration Notes

### Environment Variables Needed in Flutter

```dart
// lib/config/app_config.dart
class AppConfig {
  static const String stripePublishableKey = 'pk_test_...'; // From store config
  static const String apiBaseUrl = 'https://store-go.vercel.app';
  static const String storeId = '{{STORE_ID}}'; // Generated per store
}
```

### Important Security Points

- ✅ Never store card details in app storage
- ✅ Always use HTTPS for API calls
- ✅ Only use Stripe publishable keys (never secret keys)
- ✅ Implement proper error handling for payment failures
- ✅ Use idempotency keys for payment requests

---

## 📚 Reference Materials

### Bruno API Documentation

- Location: `Bruno/Generated app API/`
- Key files: `Orders/`, `Payments/`, `Cart/`
- Use for testing API endpoints during development

### Test Cards for Development

```
Success: 4242 4242 4242 4242
3D Secure: 4000 0025 0000 3155
Declined: 4000 0000 0000 9995
```

### Stripe Documentation

- [Flutter Stripe SDK](https://pub.dev/packages/flutter_stripe)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [3D Secure](https://stripe.com/docs/payments/3d-secure)

---

## ✅ Ready to Implement Checklist

**Server-Side (COMPLETED):**

- [x] Payment endpoints implemented
- [x] Stripe integration working
- [x] 3D Secure handling
- [x] Error handling
- [x] Webhooks configured
- [x] Multi-tenant security

**Flutter-Side (TO IMPLEMENT):**

- [ ] Add Stripe dependency
- [ ] Initialize Stripe service
- [ ] Create checkout UI
- [ ] Implement payment flow
- [ ] Handle 3D Secure
- [ ] Add success/error screens
- [ ] Test with server endpoints

**You have everything you need to start Flutter implementation! The server is production-ready.** 🚀
