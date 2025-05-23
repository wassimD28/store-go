# StoreGo Payment & Cart Analytics Documentation

This document outlines the analytics capabilities for the current payment and cart system implementation in StoreGo, based on the existing database schema and API endpoints.

## Current Database Schema Analytics Potential

### Cart Analytics Tables

Based on the existing schema:

```typescript
// Cart-related tables for analytics
AppCart: {
  id: uuid,
  storeId: uuid,          // Multi-tenant analytics
  appUserId: uuid,        // Customer behavior tracking
  status: json,           // Cart lifecycle analytics
  coupon_code: json,      // Promotion effectiveness
  created_at: timestamp,  // Cart creation trends
  updated_at: timestamp   // Cart activity patterns
}

CartItem: {
  id: uuid,
  cartId: uuid,
  productId: uuid,        // Product performance in carts
  quantity: integer,      // Quantity trends
  variants: json,         // Variant popularity
  added_at: timestamp,    // Add-to-cart patterns
  updated_at: timestamp   // Cart modification patterns
}
```

### Payment Analytics Tables

```typescript
AppPayment: {
  // Based on server controller usage
  id: uuid,
  order_id: uuid,         // Order-payment correlation
  amount: decimal,        // Revenue analytics
  currency: string,       // Multi-currency analytics
  payment_method: string, // Payment method preferences
  status: string,         // Success/failure rates
  created_at: timestamp,  // Payment timing analytics
  updated_at: timestamp   // Payment processing time
}

AppOrder: {
  // Linked to payments
  id: uuid,
  appUserId: uuid,        // Customer order patterns
  storeId: uuid,          // Store performance
  totalAmount: decimal,   // Order value analytics
  status: string,         // Order completion rates
  created_at: timestamp,  // Order timing patterns
  updated_at: timestamp   // Order fulfillment time
}
```

## Current Cart Analytics Capabilities

### 1. Cart Behavior Metrics

Based on the `CartRepository.findByUser()` method:

```typescript
// Current cart summary calculation
const summary = {
  totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: cartItems.reduce((sum, item) => {
    const price = item.product?.price ? Number(item.product.price) : 0;
    return sum + price * item.quantity;
  }, 0),
  uniqueItems: cartItems.length,
};
```

**Available Analytics:**

- Cart size distribution (items per cart)
- Average cart value by store
- Cart abandonment rates (carts never converted to orders)
- Product popularity in carts
- Variant selection patterns

### 2. Cart Lifecycle Analytics

Based on current cart operations:

```typescript
// Trackable cart events from existing methods
CartRepository.add(); // Product additions
CartRepository.update(); // Quantity modifications
CartRepository.remove(); // Product removals
CartRepository.clearCart(); // Cart abandonment
```

**Measurable Metrics:**

- Time from cart creation to checkout
- Average time between cart modifications
- Most common cart operations
- Cart conversion rates by store

### 3. Product-Cart Interaction Analytics

From `CartRepository.findCartItemByProductAndUser()`:

```typescript
// Variant-aware analytics potential
const existingItem = await this.findCartItemByProductAndUser(
  productId,
  appUserId,
  storeId,
  variants,
);
```

**Analytics Opportunities:**

- Product add-to-cart rates
- Variant popularity analysis
- Cross-selling opportunities (products frequently added together)
- Cart item lifecycle (add → modify → remove patterns)

## Current Payment Analytics Capabilities

### 1. Payment Processing Metrics

Based on `PaymentController` implementation:

```typescript
// From payment processing endpoint
const paymentIntent = await PaymentService.createPaymentIntent({
  amount,
  currency,
  orderId,
  userId,
  paymentMethodId,
  description,
});
```

**Trackable Metrics:**

- Payment success/failure rates by store
- Average transaction amounts
- Payment method preferences
- Currency distribution
- Payment processing times

### 2. Payment Method Analytics

From the current payment schema validation:

```typescript
const processPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().min(3).max(3).default("USD"),
  paymentMethodId: z.string().min(1),
  description: z.string().optional(),
});
```

**Available Data Points:**

- Payment method usage patterns
- Success rates by payment method
- Transaction amounts by method
- Geographic payment preferences (via currency)

### 3. Order-Payment Correlation

From payment controller order verification:

```typescript
const orderBelongsToUser = await PaymentRepository.verifyOrderOwnership(
  paymentData.data.order_id,
  userId,
);
```

**Analytics Potential:**

- Order-to-payment conversion rates
- Time from order creation to payment
- Failed payment recovery rates
- Order value vs. payment success correlation

## Current Promotion Analytics

Based on `CartPromotionController.checkPromotionsForCart()`:

```typescript
// Promotion effectiveness tracking
const applicablePromotions = allPromotions.filter((promotion) => {
  const hasApplicableProduct = productIds.some((productId) =>
    promotion.products?.some((item) => item.productId === productId),
  );
  const hasApplicableCategory = categoryIds.some((categoryId) =>
    promotion.categories?.some((item) => item.categoryId === categoryId),
  );
  return hasApplicableProduct || hasApplicableCategory;
});
```

**Measurable Metrics:**

- Promotion application rates
- Cart value impact of promotions
- Most effective promotion types
- Product/category promotion performance

## Implementation Gaps & Recommendations

### 1. Missing Analytics Endpoints

**Needed API Endpoints:**

```typescript
// Cart Analytics
GET / api / mobile - app / analytics / cart / summary; // Cart behavior overview
GET / api / mobile - app / analytics / cart / abandonment; // Abandonment analysis
GET / api / mobile - app / analytics / cart / products; // Product-cart performance

// Payment Analytics
GET / api / mobile - app / analytics / payments / summary; // Payment overview
GET / api / mobile - app / analytics / payments / methods; // Payment method analysis
GET / api / mobile - app / analytics / payments / trends; // Payment trends over time

// Combined Analytics
GET / api / mobile - app / analytics / conversion - funnel; // Cart-to-payment conversion
```

### 2. Missing Database Tracking

**Recommended Analytics Tables:**

```sql
-- Cart Events Tracking
CREATE TABLE cart_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  user_id UUID NOT NULL,
  cart_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'add', 'remove', 'update', 'clear'
  product_id UUID,
  quantity_before INTEGER,
  quantity_after INTEGER,
  event_timestamp TIMESTAMP DEFAULT NOW()
);

-- Payment Events Tracking
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  payment_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'initiated', 'processing', 'succeeded', 'failed'
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payment_method VARCHAR(50),
  error_code VARCHAR(50),
  event_timestamp TIMESTAMP DEFAULT NOW()
);
```

### 3. Current Real-time Analytics Potential

Based on existing Pusher integration mentioned in README:

```typescript
// Real-time analytics updates via Pusher
const channel = pusher.subscribe(`store-${storeId}-analytics`);
channel.bind("cart-updated", handleCartAnalyticsUpdate);
channel.bind("payment-completed", handlePaymentAnalyticsUpdate);
```

**Real-time Metrics:**

- Live cart activity
- Real-time revenue tracking
- Payment success rates
- Active shopping sessions

## Quick Implementation Analytics Queries

### Cart Analytics Queries

```sql
-- Cart abandonment rate
SELECT
  store_id,
  COUNT(*) as total_carts,
  COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_carts,
  (COUNT(CASE WHEN status = 'abandoned' THEN 1 END) * 100.0 / COUNT(*)) as abandonment_rate
FROM app_cart
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY store_id;

-- Average cart value
SELECT
  ac.store_id,
  AVG(cart_totals.total_value) as avg_cart_value
FROM app_cart ac
JOIN (
  SELECT
    ci.cart_id,
    SUM(ci.quantity * CAST(ap.price AS DECIMAL)) as total_value
  FROM cart_item ci
  JOIN app_product ap ON ci.product_id = ap.id
  GROUP BY ci.cart_id
) cart_totals ON ac.id = cart_totals.cart_id
WHERE ac.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ac.store_id;

-- Most added products to cart
SELECT
  ap.name,
  ap.store_id,
  COUNT(*) as times_added,
  SUM(ci.quantity) as total_quantity
FROM cart_item ci
JOIN app_product ap ON ci.product_id = ap.id
WHERE ci.added_at >= NOW() - INTERVAL '30 days'
GROUP BY ap.id, ap.name, ap.store_id
ORDER BY times_added DESC;
```

### Payment Analytics Queries

```sql
-- Payment success rates by store
SELECT
  ap.store_id,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN ap.status = 'completed' THEN 1 END) as successful_payments,
  (COUNT(CASE WHEN ap.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)) as success_rate
FROM app_payment ap
WHERE ap.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ap.store_id;

-- Revenue by payment method
SELECT
  ap.payment_method,
  ap.store_id,
  COUNT(*) as transaction_count,
  SUM(ap.amount) as total_revenue,
  AVG(ap.amount) as avg_transaction_amount
FROM app_payment ap
WHERE ap.status = 'completed'
  AND ap.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ap.payment_method, ap.store_id;

-- Daily revenue trends
SELECT
  DATE(ap.created_at) as payment_date,
  ap.store_id,
  COUNT(*) as transactions,
  SUM(ap.amount) as daily_revenue
FROM app_payment ap
WHERE ap.status = 'completed'
  AND ap.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ap.created_at), ap.store_id
ORDER BY payment_date DESC;
```

## Immediate Implementation Priority

### High Priority (Based on Current Schema)

1. Cart abandonment rate calculation
2. Payment success rate tracking
3. Average order value analytics
4. Product cart performance metrics

### Medium Priority (Requires Minor Schema Updates)

1. Cart-to-order conversion tracking
2. Payment method preference analytics
3. Promotion effectiveness measurement
4. Customer lifetime value calculation

### Low Priority (Requires Event Tracking Implementation)

1. Real-time analytics dashboard
2. Funnel analysis (view → cart → purchase)
3. A/B testing for checkout flow
4. Predictive cart abandonment alerts

This analytics framework leverages the existing StoreGo payment and cart implementation to provide actionable insights for store owners while identifying areas for enhanced data collection and reporting.
