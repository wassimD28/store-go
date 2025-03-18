import z from "zod";

export const createProductSchema = z.object({
  userId: z.string(),
  storeId: z.string(),
  categoryId: z.string(),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Product description must be less than 1000 characters")
    .optional(),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema
  .omit({
    userId: true,
    storeId: true,
  })
  .partial();
