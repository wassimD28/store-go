import { Context } from "hono";
import { ValidationError } from "../errors/validation.error";
import { userSchema } from "../schemas/user.schema";

export class UserValidator {
  static async validateCreate(c: Context) {
    try {
      // Check if the request has a body
      const contentType = c.req.header('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new ValidationError("Content-Type must be application/json", {
          contentType: "Invalid content type"
        });
      }

      // Clone the request to check if body is empty (safeguard against empty body)
      const reqClone = c.req.raw.clone();
      const text = await reqClone.text();

      if (!text || text.trim() === '') {
        throw new ValidationError("Request body is empty", {
          body: "Missing request body"
        });
      }

      // Parse the JSON body
      const body = await c.req.json();

      // Validate against schema
      const validated = await userSchema.create.parseAsync(body);
      return validated;
    } catch (error: any) {
      // Check if it's a SyntaxError from JSON parsing
      if (error instanceof SyntaxError) {
        throw new ValidationError("Invalid JSON format in request body", {
          syntax: error.message
        });
      }

      // If it's a Zod validation error
      if (error.name === "ZodError") {
        throw new ValidationError("Invalid user data to create", error);
      }

      // If it's already a ValidationError, just rethrow it
      if (error instanceof ValidationError) {
        throw error;
      }

      // For any other errors
      throw new ValidationError("Failed to validate user data", error);
    }
  }

  static async validateUpdate(c: Context) {
    try {
      // Similar improvements as validateCreate
      const contentType = c.req.header('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new ValidationError("Content-Type must be application/json", {
          contentType: "Invalid content type"
        });
      }

      const reqClone = c.req.raw.clone();
      const text = await reqClone.text();

      if (!text || text.trim() === '') {
        throw new ValidationError("Request body is empty", {
          body: "Missing request body"
        });
      }

      const body = await c.req.json();
      const validated = await userSchema.update.parseAsync(body);
      return validated;
    } catch (error : any) {
      // Don't send response here, let controller handle it
      if (error instanceof SyntaxError) {
        throw new ValidationError("Invalid JSON format in request body", {
          syntax: error.message
        });
      }

      if (error.name === "ZodError") {
        throw new ValidationError("Invalid user data to update", error);
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError("Failed to validate user data", error);
    }
  }
}