import { relations } from "drizzle-orm";
import { boolean, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/pg-core";

// Define an enum for product statuses:
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "out_of_stock",
  "archived",
]);
export const AgeRangeEnum = pgEnum("age_range_enum", [
  "13-18",
  "19-25",
  "26-35",
  "36-45",
  "46-60",
  "60+",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
  "buy_x_get_y",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});
// Define the accounts table schema (simplified)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Define the jobs table
export const generationJobs = pgTable("generation_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  config: jsonb("config"),
  downloadUrl: varchar("download_url", { length: 500 }),
});
// Define store category table
export const storeCategory = pgTable("store_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 50 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define a stores table (simplified)
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => storeCategory.id),
  name: varchar("name", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  appUrl: varchar("app_url", { length: 500 }),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const AppUserAuthType = pgEnum("app_user_auth_type", [
  "email_password",
  "oauth",
]);

export const AppUser = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  gender: varchar("gender", { length: 10 }),
  age_range: AgeRangeEnum("age_range"),
  auth_type: AppUserAuthType("auth_type").notNull().default("email_password"),
  auth_provider: varchar("auth_provider", { length: 50 }), // "google", "facebook", etc.
  provider_user_id: varchar("provider_user_id", { length: 255 }), // ID from the provider
  status: boolean("status").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// AppAddress table schema
export const AppAddress = pgTable("app_address", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// AppOrder table schema
export const AppOrder = pgTable("app_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  address_id: uuid("address_id")
    .notNull()
    .references(() => AppAddress.id),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
    .default('0')
    .notNull(),
  appliedPromotionId: uuid("applied_promotion_id").references(
    () => AppPromotion.id,
  ),
  couponCode: varchar("coupon_code", { length: 50 }),
  data_amount: decimal("data_amount", { precision: 10, scale: 2 }).notNull(),
  order_date: timestamp("order_date").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  payment_status: varchar("payment_status", { length: 50 }).notNull(),
});
// AppPayment table schema
export const AppPayment = pgTable("app_payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payment_date: timestamp("payment_date").defaultNow(),
  payment_method: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
});

// AppCollection table schema
export const AppCollection = pgTable("app_collection", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => AppOrder.id),
  quantity: integer("quantity").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// AppWishlist table schema
export const AppWishlist = pgTable("app_wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  product_id: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  added_at: timestamp("added_at").defaultNow().notNull(),
});

// AppCategory table schema
export const AppCategory = pgTable("app_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
export const AppSubCategory = pgTable("app_subcategory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  parentCategoryId: uuid("parent_category_id")
    .notNull()
    .references(() => AppCategory.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const AppReview = pgTable("app_review", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
export const targetGenderEnum = pgEnum("target_gender", [
  "male",
  "female",
  "unisex",
]);
// AppProduct table drizzle schema
export const AppProduct = pgTable("app_product", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => AppCategory.id),
  subcategoryId: uuid("subcategory_id").references(() => AppSubCategory.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  attributes: json("attributes").default({}),
  colors: json("colors").default({}),
  size: json("size").default({}),
  image_urls: json("image_urls").default([]),
  stock_quantity: integer("stock_quantity").default(0).notNull(),
  status: productStatusEnum("status").default("draft").notNull(),
  targetGender: targetGenderEnum("target_gender").default("unisex").notNull(),
  unitsSold: integer("units_sold").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

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
  discountType: discountTypeEnum("discount_type").notNull(), // percentage, fixed_amount, free_shipping, buy_x_get_y
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }), // Amount or percentage off
  couponCode: varchar("coupon_code", { length: 50 }), // Optional coupon code
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }).default('0'), // Minimum order value
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  applicableProducts: json("applicable_products").default([]), // Array of product IDs
  applicableCategories: json("applicable_categories").default([]), // Array of category IDs
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Define relations for the stores table
export const storesRelations = relations(stores, ({ one }) => ({
  category: one(storeCategory, {
    fields: [stores.categoryId],
    references: [storeCategory.id],
  }),
}));

// Define relations for the storeCategory table
export const storeCategoryRelations = relations(storeCategory, ({ many }) => ({
  stores: many(stores),
}));

// Define relations for AppProduct
export const AppProductRelations = relations(AppProduct, ({ one }) => ({
  category: one(AppCategory, {
    fields: [AppProduct.categoryId],
    references: [AppCategory.id],
  }),
}));

export const AppReviewsRelations = relations(AppReview, ({ one }) => ({
  product: one(AppProduct, {
    fields: [AppReview.productId],
    references: [AppProduct.id],
  }),
  appUser: one(AppUser, {
    fields: [AppReview.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppReview.storeId],
    references: [stores.id],
  }),
}));
// Define relations for AppWishlist
export const AppWishlistRelations = relations(AppWishlist, ({ one }) => ({
  product: one(AppProduct, {
    fields: [AppWishlist.product_id],
    references: [AppProduct.id],
  }),
  appUser: one(AppUser, {
    fields: [AppWishlist.appUserId],
    references: [AppUser.id],
  }),
  store: one(stores, {
    fields: [AppWishlist.storeId],
    references: [stores.id],
  }),
}));

export const AppPromotionRelations = relations(AppPromotion, ({ one }) => ({
  store: one(stores, {
    fields: [AppPromotion.storeId],
    references: [stores.id],
  }),
}));

export const AppOrderRelations = relations(AppOrder, ({ one }) => ({
  appliedPromotion: one(AppPromotion, {
    fields: [AppOrder.appliedPromotionId],
    references: [AppPromotion.id],
  }),
  address: one(AppAddress, {
    fields: [AppOrder.address_id],
    references: [AppAddress.id],
  }),
}));
