import { DiscountType } from "@/lib/types/enums/common.enum";

// For improved type safety across the application
type DiscountTypeStrings =
  | "percentage"
  | "fixed_amount"
  | "free_shipping"
  | "buy_x_get_y";

// Product interface from database
export interface ProductObject {
  id: string;
  name?: string;
  price?: string;
  image_urls?: string[];
  description?: string;
  [key: string]: unknown;
}

// Category interface from database
export interface CategoryObject {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

// Base promotion interface from database
export interface DBPromotion {
  id: string;
  storeId: string;
  userId: string;
  name: string;
  description: string | null;
  discountType: DiscountType | DiscountTypeStrings;
  discountValue: string;
  couponCode: string | null;
  minimumPurchase: string;
  promotionImage: string | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  sameProductOnly: boolean | null;
  usageCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  // Optional relation properties
  products?: { promotionId: string; productId: string; product?: ProductObject }[];
  categories?: { promotionId: string; categoryId: string; category?: CategoryObject }[];
  yProducts?: { promotionId: string; productId: string; product?: ProductObject }[];
  yCategories?: { promotionId: string; categoryId: string; category?: CategoryObject }[];
  // Legacy fields that might still exist in the database
  applicableProducts?: string[] | ProductObject[];
  applicableCategories?: string[] | CategoryObject[];
  yApplicableProducts?: string[] | ProductObject[];
  yApplicableCategories?: string[] | CategoryObject[];
}

// Extended interface that includes transformed properties for frontend
export interface PromotionWithRelations extends Omit<DBPromotion, 'applicableProducts' | 'applicableCategories' | 'yApplicableProducts' | 'yApplicableCategories'> {
  applicableProducts: ProductObject[];
  applicableCategories: CategoryObject[];
  yApplicableProducts: ProductObject[];
  yApplicableCategories: CategoryObject[];
  [key: string]: unknown;
}

// Interface for creating/updating promotions
export interface PromotionInput {
  userId: string;
  storeId: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  couponCode: string | null;
  minimumPurchase: number;
  promotionImage: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  sameProductOnly?: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
  yApplicableProducts?: string[];
  yApplicableCategories?: string[];
}

// Interface for updating promotions - excludes some fields
export interface PromotionUpdateInput {
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  couponCode: string | null;
  minimumPurchase: number;
  promotionImage: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  sameProductOnly?: boolean;
  productIds: string[];
  categoryIds: string[];
  yProductIds?: string[];
  yCategoryIds?: string[];
}
