import z from "zod"

export const createCategorySchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Category name is required").max(100, "Category name must be less than 100 characters"),
  description: z.string().max(255, "Category description must be less than 255 characters").optional(),
  imageUrl : z.string().optional(),
})

export const updateCategorySchema = createCategorySchema.pick({
  name: true,
  description: true,
  imageUrl: true
})
