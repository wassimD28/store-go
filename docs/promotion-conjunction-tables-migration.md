# Promotion System: Migration to Conjunction Tables

## Current Architecture Overview

The StoreGo platform currently manages promotion-product relationships through JSON arrays in the `AppPromotion` table:

- `applicableProducts`: Array of product IDs stored as JSON
- `applicableCategories`: Array of category IDs stored as JSON

This implementation has led to several challenges:

1. **Complex SQL Queries**: The system relies on complex PostgreSQL JSON array operations that require fallback mechanisms when SQL expressions fail.
2. **Format Inconsistencies**: The system must handle both string and array representations of JSON data.
3. **Limited Query Performance**: As the number of products and promotions grows, array-based searches become less efficient.
4. **Lack of Referential Integrity**: No database-enforced constraints to ensure product/category IDs exist.
5. **Maintenance Complexity**: Debugging and extending this approach requires handling multiple edge cases.

## Proposed Migration: Conjunction Tables

### Database Schema Changes

We'll introduce two new conjunction tables to replace the JSON arrays:

```typescript
// New conjunction tables
export const PromotionProduct = pgTable("promotion_product", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const PromotionCategory = pgTable("promotion_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => AppPromotion.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => AppCategory.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
```

### AppPromotion Table Modifications

We'll update the `AppPromotion` table to remove the now-redundant JSON fields:

```typescript
export const AppPromotion = pgTable("app_promotion", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  minimumPurchase: decimal("minimum_purchase", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  buyQuantity: integer("buy_quantity"),
  getQuantity: integer("get_quantity"),
  sameProductOnly: boolean("same_product_only").default(true),
  promotionImage: varchar("promotion_image", { length: 500 }),
  usageCount: integer("usage_count").default(0).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Removed: applicableProducts and applicableCategories JSON fields
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
```

### Relations Configuration

We'll update the Drizzle ORM relations to include the new conjunction tables:

```typescript
export const AppPromotionRelations = relations(
  AppPromotion,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [AppPromotion.storeId],
      references: [stores.id],
    }),
    user: one(user, {
      fields: [AppPromotion.userId],
      references: [user.id],
    }),
    products: many(PromotionProduct),
    categories: many(PromotionCategory),
  }),
);

export const PromotionProductRelations = relations(
  PromotionProduct,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionProduct.promotionId],
      references: [AppPromotion.id],
    }),
    product: one(AppProduct, {
      fields: [PromotionProduct.productId],
      references: [AppProduct.id],
    }),
  }),
);

export const PromotionCategoryRelations = relations(
  PromotionCategory,
  ({ one }) => ({
    promotion: one(AppPromotion, {
      fields: [PromotionCategory.promotionId],
      references: [AppPromotion.id],
    }),
    category: one(AppCategory, {
      fields: [PromotionCategory.categoryId],
      references: [AppCategory.id],
    }),
  }),
);
```

## Benefits of the New Approach

### 1. Performance Improvements

- **Standard JOIN Operations**: More efficient than JSON array searches
- **Better Indexing**: Can create indexes on foreign keys for faster lookups
- **Predictable Query Performance**: Scales better with increased data volume

### 2. Data Integrity Enhancements

- **Foreign Key Constraints**: Ensures that products and categories actually exist
- **Automatic Cleanup**: Cascade delete options remove related entries when a promotion is deleted
- **Consistent Data Types**: No more handling of different JSON formats

### 3. Development Experience

- **Simpler Queries**: Standard relational database patterns
- **Better IDE Support**: Type safety and autocompletion for relations
- **Clearer Data Model**: Explicit relationships versus implicit JSON arrays

### 4. Future Extensibility

- **Additional Attributes**: Easily add fields to the relationship (e.g., priority, custom discount for specific product)
- **Filtering Capabilities**: More granular filtering and sorting options
- **Analytics Potential**: Easier to query for statistics and reporting

## Migration Plan

### Phase 1: Infrastructure Setup (1-2 days)

1. Create migration file to add new conjunction tables
2. Deploy changes to staging environment without modifying application code
3. Implement and test data access patterns with the new schema

### Phase 2: Data Migration (2-3 days)

1. Create a migration script to:
   - Read existing JSON arrays from `AppPromotion` table
   - Insert appropriate records into conjunction tables
   - Validate data consistency between old and new approaches
2. Run the migration in staging to verify correctness
3. Create a rollback plan in case of issues

```typescript
// Example migration script outline
const migratePromotionRelations = async () => {
  const promotions = await db.query.AppPromotion.findMany();

  for (const promotion of promotions) {
    let applicableProducts = [];
    let applicableCategories = [];

    // Handle different formats of JSON data
    try {
      if (promotion.applicableProducts) {
        if (typeof promotion.applicableProducts === "string") {
          applicableProducts = JSON.parse(promotion.applicableProducts);
        } else if (Array.isArray(promotion.applicableProducts)) {
          applicableProducts = promotion.applicableProducts;
        }
      }

      if (promotion.applicableCategories) {
        if (typeof promotion.applicableCategories === "string") {
          applicableCategories = JSON.parse(promotion.applicableCategories);
        } else if (Array.isArray(promotion.applicableCategories)) {
          applicableCategories = promotion.applicableCategories;
        }
      }
    } catch (error) {
      console.error(`Error parsing JSON for promotion ${promotion.id}:`, error);
      continue;
    }

    // Insert product relationships
    for (const productId of applicableProducts) {
      try {
        await db.insert(PromotionProduct).values({
          promotionId: promotion.id,
          productId,
        });
      } catch (error) {
        console.error(
          `Error inserting product relation ${productId} for promotion ${promotion.id}:`,
          error,
        );
      }
    }

    // Insert category relationships
    for (const categoryId of applicableCategories) {
      try {
        await db.insert(PromotionCategory).values({
          promotionId: promotion.id,
          categoryId,
        });
      } catch (error) {
        console.error(
          `Error inserting category relation ${categoryId} for promotion ${promotion.id}:`,
          error,
        );
      }
    }
  }
};
```

### Phase 3: Repository Updates (3-4 days)

1. Update `PromotionRepository` methods to use the new schema
2. Create dual-implementation during transition with feature flag
3. Update unit tests to cover both implementations

#### Example Updated Repository Method

```typescript
static async findByProductId(productId: string, storeId: string) {
  try {
    const product = await db.query.AppProduct.findFirst({
      where: eq(AppProduct.id, productId),
      columns: { id: true, categoryId: true }
    });

    if (!product) return [];

    const now = new Date();

    // Cleaner query using JOINs
    const promotions = await db.query.AppPromotion.findMany({
      where: and(
        eq(AppPromotion.storeId, storeId),
        eq(AppPromotion.isActive, true),
        lte(AppPromotion.startDate, now),
        gte(AppPromotion.endDate, now)
      ),
      with: {
        products: {
          where: eq(PromotionProduct.productId, productId)
        },
        categories: product.categoryId ? {
          where: eq(PromotionCategory.categoryId, product.categoryId)
        } : undefined
      }
    });

    // Filter for promotions that match either product or category
    return promotions.filter(p =>
      p.products.length > 0 ||
      (p.categories && p.categories.length > 0)
    );
  } catch (error) {
    console.error(`Error fetching promotions for product ${productId}:`, error);
    return [];
  }
}
```

### Phase 4: Controller & API Updates (2-3 days)

1. Update `PromotionController` methods to support the new data structure
2. Ensure API responses maintain the same format for backward compatibility
3. Deploy changes to staging and run integration tests

### Phase 5: Admin Dashboard Updates (3-4 days)

1. Update promotion creation and editing forms
2. Modify promotion management UI to show related products/categories
3. Update client-side validation and error handling

### Phase 6: Production Deployment (1-2 days)

1. Execute database migration in production with minimal downtime
2. Deploy updated application code
3. Monitor for any issues or performance changes

### Phase 7: Cleanup (1-2 days)

1. Remove JSON array columns after confirming successful migration
2. Remove any deprecated code and dual-implementation patterns
3. Update documentation to reflect the new data model

## Considerations and Risks

### 1. Migration Complexity

**Risk**: Data inconsistency during migration if JSON parsing fails for some records.

**Mitigation**:

- Thorough validation before and after migration
- Manual review of any problematic records
- Temporary dual-storage approach if needed

### 2. Query Performance Changes

**Risk**: New query patterns could have unexpected performance characteristics.

**Mitigation**:

- Benchmark both approaches before full migration
- Add appropriate indexes on foreign keys
- Monitor query performance metrics after deployment

### 3. API Compatibility

**Risk**: Changes might affect mobile app functionality.

**Mitigation**:

- Maintain consistent API response format
- Thorough integration testing with mobile app scenarios
- Phased rollout with ability to quickly revert

### 4. Development Impact

**Risk**: Ongoing feature development could be disrupted.

**Mitigation**:

- Schedule migration during lower development activity
- Clear communication with all development teams
- Feature flag to temporarily disable new promotion creation if needed

## Monitoring and Success Metrics

### 1. Performance Metrics

- **Query Response Time**: Measure before and after for key promotion endpoints
- **Database Load**: Monitor CPU and I/O during peak usage
- **Mobile App Performance**: Track client-side rendering times

### 2. Reliability Metrics

- **Error Rate**: Monitor for any increase in API errors
- **Data Consistency**: Verify promotion relationships are intact
- **Service Availability**: Ensure no disruption during migration

### 3. Development Metrics

- **Code Complexity**: Reduced lines of code for common promotion queries
- **Bug Rate**: Track issues related to promotions before and after
- **Development Velocity**: Measure time to implement new promotion features

## Conclusion

Migrating to a conjunction table approach represents a significant architectural improvement for the StoreGo promotion system. While the migration requires careful planning and execution, the benefits in terms of performance, reliability, and maintainability justify the investment. The improved data model will better support future feature development and scale more effectively as the platform grows.

## Next Steps

1. Review this migration plan with the development and database teams
2. Schedule planning session to refine timeline and resource allocation
3. Create detailed task breakdown for implementation
4. Develop test cases to validate the new approach
