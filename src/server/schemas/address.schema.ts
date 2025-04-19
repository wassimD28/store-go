import z from "zod";

export const createAddressSchema = z.object({
  storeId: z.string(),
  app_user_id: z.string(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().default(false),
  status: z.string().optional(), // Add status field
});

export const updateAddressSchema = createAddressSchema
  .omit({ app_user_id: true })
  .partial();