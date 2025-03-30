export type AppCategory = {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  created_at: Date;
  updated_at: Date;
};

export type StoreCategoryPayload = {
  id: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
}

// Define the StoreCategory data structure
export interface StoreCategoryData {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  updatedAt: Date;
  createdAt: Date;
}

// Define the Store data structure, including its related category
export interface StoreData {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  logoUrl?: string;
  appUrl?: string;
  lastGeneratedAt?: Date;
  createdAt: Date;
  category: StoreCategoryData;
}
