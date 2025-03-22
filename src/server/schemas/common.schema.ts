import z from "zod"

// schema to validate id parameter if it is valid uuid 
export const idSchema = z.string().uuid("Invalid ID")