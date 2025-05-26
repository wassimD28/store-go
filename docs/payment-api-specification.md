# StoreGo Payment API Specification

## Base URL

```
https://store-go.vercel.app
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {jwt_token}
```

---

## 🛒 Order & Payment Flow

### 1. Create Order from Cart

```http
POST /api/mobile-app/orders
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA",
    "phone": "+1-555-0123"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA",
    "phone": "+1-555-0123"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver to front door"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "orderId": "82d94ef6-3727-4f1e-81c8-d487867834c2",
    "orderNumber": "ORD-12345678-ABCD",
    "totalAmount": 125.99,
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

### 2. Pay for Order (MAIN PAYMENT ENDPOINT)

```http
POST /api/mobile-app/orders/{orderId}/pay
Content-Type: application/json

{
  "paymentMethod": "credit_card",
  "paymentToken": "pm_1234567890abcdef",
  "savePaymentMethod": false
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "payment-uuid",
    "orderId": "order-uuid",
    "amount": 125.99,
    "status": "succeeded"
  }
}
```

**3D Secure Required Response (200):**

```json
{
  "status": "requires_action",
  "message": "Additional authentication required",
  "data": {
    "paymentId": "payment-uuid",
    "paymentIntentId": "pi_1234567890abcdef",
    "clientSecret": "pi_1234567890abcdef_secret_xyz123"
  }
}
```

**Error Response (400):**

```json
{
  "status": "error",
  "message": "Order is already paid"
}
```

---

## 💳 Payment Methods Management

### Get Saved Payment Methods

```http
GET /api/mobile-app/payments/methods
```

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "pm-uuid",
      "type": "credit_card",
      "details": {
        "brand": "visa",
        "last4": "4242",
        "expiryMonth": "12",
        "expiryYear": "2025"
      },
      "isDefault": true
    }
  ]
}
```

### Save Payment Method

```http
POST /api/mobile-app/payments/methods
Content-Type: application/json

{
  "type": "credit_card",
  "stripePaymentMethodId": "pm_1234567890abcdef",
  "isDefault": true,
  "details": {
    "brand": "visa",
    "last4": "4242",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cardholderName": "John Doe"
  }
}
```

### Delete Payment Method

```http
DELETE /api/mobile-app/payments/methods/{id}
```

### Set Default Payment Method

```http
PUT /api/mobile-app/payments/methods/{id}/default
```

---

## 📦 Cart Integration

### Get Cart Summary

```http
GET /api/mobile-app/cart/summary
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "item-uuid",
        "productId": "product-uuid",
        "quantity": 2,
        "price": 24.99,
        "total": 49.98
      }
    ],
    "subtotal": 49.98,
    "tax": 5.0,
    "shipping": 15.0,
    "total": 69.98,
    "itemCount": 2
  }
}
```

---

## 📊 Order Management

### Get User Orders

```http
GET /api/mobile-app/orders
```

### Get Order Details

```http
GET /api/mobile-app/orders/{orderId}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-12345678-ABCD",
    "status": "pending",
    "paymentStatus": "paid",
    "totalAmount": 125.99,
    "items": [...],
    "shippingAddress": {...},
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## ⚠️ Error Handling

### Common Error Responses

**Invalid Order ID (400):**

```json
{
  "status": "error",
  "message": "Invalid order ID"
}
```

**Order Not Found (404):**

```json
{
  "status": "error",
  "message": "Order not found"
}
```

**Payment Processing Failed (400):**

```json
{
  "status": "error",
  "message": "Payment processing failed"
}
```

**Authentication Required (401):**

```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**Server Error (500):**

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 🧪 Testing

### Test Environment

- Base URL: `https://store-go.vercel.app`
- Use Stripe test keys in development
- Test cards available in Stripe documentation

### Test Cards

```
Success: 4242 4242 4242 4242
3D Secure: 4000 0025 0000 3155
Declined: 4000 0000 0000 9995
```

### Test Flow

1. Create test order with cart items
2. Use test payment method ID
3. Process payment through `/orders/{orderId}/pay`
4. Handle 3D Secure if required
5. Verify order status updated to "paid"

---

## 🔐 Security Notes

- All endpoints require valid JWT token
- Payment tokens should be created client-side with Stripe
- Never send raw card data to server
- Use HTTPS for all requests
- Implement proper error handling
- Store only tokenized payment method references
