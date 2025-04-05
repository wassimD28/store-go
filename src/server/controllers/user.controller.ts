import { UserRepository } from "@/server/repositories/user.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";
import { Context } from "hono";

// Define validation schema for user updates with more specific validations
const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email format").optional(),
    image: z.string().url("Invalid URL format").optional(),
    gender: z.string().optional(),
    age_range: z
      .enum(["13-18", "19-25", "26-35", "36-45", "46-60", "60+"])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["_all"], // This indicates the error applies to the whole object
  });

export class UserController {
  static async updateUser(c: Context) {
    try {
      // Get user ID from params
      const id = c.req.param("userId");

      // Validate user ID
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid user ID format",
            details: validId.error.errors,
          },
          400,
        );
      }

      // Check if request body exists
      let body;
      try {
        body = await c.req.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Missing or invalid request body",
          },
          400,
        );
      }

      // Check for empty request body
      if (!body || Object.keys(body).length === 0) {
        return c.json(
          {
            status: "error",
            message:
              "Request body cannot be empty. Provide at least one field to update.",
          },
          400,
        );
      }

      // Parse and validate request data
      const validatedData = updateUserSchema.safeParse(body);
      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid user data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      // Verify the user exists before attempting update
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return c.json(
          {
            status: "error",
            message: `User with ID ${id} not found`,
          },
          404,
        );
      }

      // Check permissions (optional - depending on your requirements)
      // This assumes you have some way to get the current user's ID from the auth context
      const { id: currentUserId } = c.get("user"); // This would be set by your auth middleware
      if (currentUserId !== id) {
        // If the user is not updating their own profile and isn't an admin
        const isAdmin = c.get("isAdmin") || false;
        if (!isAdmin) {
          return c.json(
            {
              status: "error",
              message: "You don't have permission to update this user",
            },
            403,
          );
        }
      }

      // Update the user
      const updatedUser = await UserRepository.update(id, validatedData.data);

      // Return success response with updated user data
      return c.json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error in updateUser:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("unique constraint")) {
          return c.json(
            {
              status: "error",
              message: "Email already in use by another account",
            },
            409, // Conflict
          );
        }
      }

      // General error handler
      return c.json(
        {
          status: "error",
          message: "Failed to update user information",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }
}
