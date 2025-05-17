# Product Promotions Endpoint Workflow Documentation

## Overview

This document provides a comprehensive explanation of the product promotions endpoint workflow, which is responsible for retrieving active promotions applicable to a specific product in the StoreGo e-commerce platform.

**Endpoint:** `GET /api/mobile-app/promotions/product/{productId}`

## Workflow Diagram

```
┌──────────────┐      ┌───────────────┐      ┌────────────────────┐      ┌───────────────────┐
│  Mobile App  │──────▶  API Gateway  │──────▶  findByProductId() │──────▶  Database Queries │
└──────────────┘      └───────────────┘      └────────────────────┘      └───────────────────┘
                                                      │
                             ┌─────────────────────────┴────────────────────┐
                             ▼                                              ▼
                     ┌──────────────┐                               ┌───────────────┐
                     │ Success Path │                               │ Error Paths   │
                     └──────────────┘                               └───────────────┘
                             │                                              │
                             ▼                                              ▼
                     ┌──────────────────────┐                      ┌───────────────────────────┐
                     │ Return Promotions    │                      │ Return Empty Array        │
                     │ List with Details    │                      │ with Detailed Logs        │
                     └──────────────────────┘                      └───────────────────────────┘
```

## Request Flow

1. **Client Request**:

   - The mobile app sends a GET request to `/api/mobile-app/promotions/product/{productId}`
   - Request includes authentication token in the header
   - The `productId` is passed as a path parameter

2. **Authentication & Authorization**:

   - The API gateway verifies the JWT token
   - Confirms the user has access to the requested store

3. **Controller Processing**:
   - The appropriate controller receives the request
   - Extracts the `productId` from the path parameters
   - Extracts the `storeId` from the authenticated user context
   - Calls the `PromotionRepository.findByProductId()` method

## Repository Method: `findByProductId()`

This method implements a resilient approach to retrieving promotions for a product:

### Step 1: Product Lookup

```typescript
// First get the product to access its category
const product = await db.query.AppProduct.findFirst({
  where: eq(AppProduct.id, productId),
  columns: {
    id: true,
    categoryId: true,
  },
});

if (!product) {
  console.log(`No product found with ID: ${productId}`);
  return [];
}
```

### Step 2: Primary Query Approach

The method attempts an optimized query using SQL expressions:

1. First performs a basic test query to verify database connectivity
2. Then executes the full query with conditions:
   - Promotion belongs to the same store
   - Promotion is active
   - Current date is between start and end dates
   - Product ID is in `applicableProducts` array OR product's category is in `applicableCategories` array

```typescript
return await db.query.AppPromotion.findMany({
  where: and(
    eq(AppPromotion.storeId, storeId),
    eq(AppPromotion.isActive, true),
    lte(AppPromotion.startDate, now),
    gte(AppPromotion.endDate, now),
    or(
      // SQL expression to check if productId is in applicableProducts array
      sql`${productId}::text = ANY(SELECT jsonb_array_elements_text(COALESCE(${AppPromotion.applicableProducts}::jsonb, '[]'::jsonb)))`,
      // SQL expression to check if categoryId is in applicableCategories array
      sql`${product.categoryId}::text = ANY(SELECT jsonb_array_elements_text(COALESCE(${AppPromotion.applicableCategories}::jsonb, '[]'::jsonb)))`,
    ),
  ),
});
```

### Step 3: Fallback Approach

If the optimized query fails due to SQL errors, a fallback approach is used:

1. Fetch all active promotions for the store without complex JSON conditions
2. Filter the results in JavaScript to match the product ID or category ID
3. Handle different JSON formats (string or array) that might be stored in the database

```typescript
// Get all active promotions for this store
const allActivePromotions = await db.query.AppPromotion.findMany({
  where: and(
    eq(AppPromotion.storeId, storeId),
    eq(AppPromotion.isActive, true),
    lte(AppPromotion.startDate, now),
    gte(AppPromotion.endDate, now),
  ),
});

// Filter in JavaScript for applicable products or categories
const filteredPromotions = allActivePromotions.filter((promotion) => {
  // Process JSON data to extract arrays
  // Return true if product or category matches
});
```

### Step 4: Error Handling

The method implements robust error handling:

- Detailed error logging with complete error information
- Returns empty array instead of throwing exceptions to ensure API stability
- Captures stack traces for debugging purposes

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Summer Sale",
      "description": "Get 20% off all summer items",
      "discountType": "percentage",
      "discountValue": "20.00",
      "startDate": "2025-06-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z",
      "minimumPurchase": "0.00"
      // Additional promotion fields...
    }
  ]
}
```

### Empty Response (200 OK)

When no promotions are found:

```json
{
  "status": "success",
  "data": []
}
```

### Error Response (Handled internally - returns empty array)

```json
{
  "status": "success",
  "data": []
}
```

## Common Issues and Solutions

### 1. JSON Array Format Issues

**Problem:** The `applicableProducts` and `applicableCategories` fields might be stored in different JSON formats (string or array).

**Solution:** The implementation handles multiple data formats:

```typescript
if (typeof promotion.applicableProducts === "string") {
  applicableProducts = JSON.parse(promotion.applicableProducts);
} else if (Array.isArray(promotion.applicableProducts)) {
  applicableProducts = promotion.applicableProducts;
}
```

### 2. Database Query Errors

**Problem:** Complex SQL expressions for JSON arrays might fail on certain database configurations.

**Solution:** The implementation falls back to a simpler query and JavaScript filtering when SQL errors occur.

### 3. Missing Product Issues

**Problem:** The requested product ID might not exist in the database.

**Solution:** The method checks for product existence first and returns an empty array if not found:

```typescript
if (!product) {
  console.log(`No product found with ID: ${productId}`);
  return [];
}
```

## Debugging Guide

When troubleshooting issues with this endpoint, look for these log patterns:

1. **Basic connectivity:** Look for "Basic query returned: X results"
2. **Product lookup:** Check for "No product found with ID: X" messages
3. **SQL errors:** Look for "Optimized query failed, using fallback approach: X"
4. **Data format:** Examine "Sample promotion structure:" logs
5. **Processing results:** Check "Filtered to X applicable promotions"

## Performance Considerations

- The endpoint uses an optimized SQL query when possible
- Fallback to JavaScript filtering might be slower with large datasets
- Consider adding database indexes on `storeId`, `isActive`, `startDate`, and `endDate`
- Consider caching common promotion lookups

## Security Considerations

- The endpoint verifies store access through authentication
- Multi-tenant data separation is enforced through `storeId` filtering
- All user inputs are properly sanitized before database queries
