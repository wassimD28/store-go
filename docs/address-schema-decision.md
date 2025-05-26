# Address Schema Design Decision

## Decision: Keep Address Table Clean

After analyzing the current implementation and database schema, we've decided to keep the address table focused on location data only, without `firstName` and `lastName` fields.

## Current Schema

```typescript
// AppAddress table - Location data only
export const AppAddress = pgTable("app_address", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  appUserId: uuid("app_user_id").notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(), // Note: postalCode not zipCode
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  status: varchar("status", { length: 50 }).default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// AppUser table - User identity data
export const AppUser = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // Single name field
  email: varchar("email", { length: 255 }).notNull(),
  // ... other fields
});
```

## Benefits of This Approach

### ✅ Data Normalization

- Eliminates data duplication
- Single source of truth for user names
- Automatic updates when user changes name

### ✅ Simplified Schema

- Address table focuses on location data
- User table handles identity data
- Clear separation of concerns

### ✅ Flexibility

- User name changes reflect everywhere automatically
- Can still handle business/gift deliveries via order notes
- Easier to maintain and query

## API Implementation

### Order Creation

```typescript
// API expects addresses without name fields
{
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Boston",
    "state": "MA",
    "postalCode": "02101", // Use postalCode (not zipCode)
    "country": "USA",
    "phone": "+1-555-0123"
  }
}
```

### Name Resolution

```typescript
// When shipping labels are needed:
const order = await getOrderWithUser(orderId);
const shippingName = order.user.name; // From AppUser table
const shippingAddress = order.shippingAddress; // From order
```

## Edge Cases Handled

### Business Deliveries

- Use order `notes` field for company names
- Example: `"notes": "Deliver to: Acme Corp, Attn: John Doe"`

### Gift Deliveries

- Use order `notes` field for recipient
- Example: `"notes": "Gift for: Jane Smith, Birthday surprise"`

### Multiple Recipients

- Create separate orders for different recipients
- Each order can have different notes

## Migration Notes

### ✅ Already Fixed

- Order creation schema updated to match database
- Bruno API collection updated
- Repository types corrected

### 🔄 If Name Fields Are Needed Later

```sql
-- Can add later if business requirements change
ALTER TABLE app_address ADD COLUMN recipient_first_name VARCHAR(100);
ALTER TABLE app_address ADD COLUMN recipient_last_name VARCHAR(100);
```

## Conclusion

The current clean schema design is optimal for:

- E-commerce platforms with personal addresses
- Simple delivery scenarios
- Data consistency and maintenance

This decision maintains the integrity of the normalized database design while providing flexibility for future enhancements if needed.
