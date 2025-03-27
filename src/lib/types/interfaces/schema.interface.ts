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
