import z from "zod"

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  description: z
    .string()
    .max(255, "Category description must be less than 255 characters")
    .optional(),
  parentCategory: z.string().optional(),
  imageUrl: z.string().optional(),
  isMainCategory: z.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.pick({
  name: true,
  description: true,
  imageUrl: true
})
