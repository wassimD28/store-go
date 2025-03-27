import { boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/pg-core";

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

// Define a stores table (simplified)
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  appUrl: varchar("app_url", { length: 500 }),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AppUser table schema
export const AppUser = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  description: text("description"),
  status: boolean("status").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
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
  data_amount: decimal("data_amount", { precision: 10, scale: 2 }).notNull(),
  order_date: timestamp("order_date").defaultNow(),
  status: varchar("status", { length: 50 }).notNull(),
  payment_status: varchar("payment_status", { length: 50 }).notNull(),
});

// AppAddress table schema
export const AppAddress = pgTable("app_address", {
  id: uuid("id").primaryKey().defaultRandom(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  street: varchar("street", { length: 255 }).notNull(), // Added missing street field
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(), // Added missing state field
  status: varchar("status", { length: 50 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("isDefault").default(false),
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
  status: varchar("status", { length: 50 }).notNull().default("pending"), // Added status field based on your schema
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

// AppFactory table schema
export const AppFactory = pgTable("app_factory", {
  id: uuid("id").primaryKey().defaultRandom(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => AppUser.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  snapshot: text("snapshot"),
});

// AppWishlist table schema
export const AppWishlist = pgTable("app_wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id")
    .notNull()
    .references(() => AppProduct.id),
  added_date: timestamp("added_date").defaultNow(),
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
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
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
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// AppProduct table schema
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
  image_urls: text("image_urls"),
  stock_quantity: integer("stock_quantity").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
