import {
  boolean,
  uuid,
  jsonb,
  
} from "drizzle-orm/pg-core";
import { integer, pgTable, serial, text, timestamp, varchar, decimal, json } from 'drizzle-orm/pg-core';


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





export const appCategories = pgTable('app_categories', {
  id: serial('id').primaryKey(),
  store_id: integer('store_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const appProducts = pgTable('app_products', {
  id: serial('id').primaryKey(),
  category_id: integer('category_id').references(() => appCategories.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  attributes: json('attributes').default({}),
  image_urls: json('image_urls').default([]),
  stock_quantity: integer('stock_quantity').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Type definitions for the tables
export type AppCategory = typeof appCategories.$inferSelect;
export type NewAppCategory = Omit<AppCategory, 'id' | 'createdAt' | 'updatedAt'>;

export type AppProduct = typeof appProducts.$inferSelect;
export type NewAppProduct = Omit<AppProduct, 'id' | 'createdAt' | 'updatedAt'>;