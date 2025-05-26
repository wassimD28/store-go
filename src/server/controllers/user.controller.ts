import { UserRepository } from "@/server/repositories/user.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";
import { Context } from "hono";
import { AppUser } from "@/lib/db/schema";
import { db } from "@/lib/db/db";
import { eq, and } from "drizzle-orm";
import Pusher from "pusher";

// Define validation schema for user updates with more specific validations
const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email format").optional(),
    avatar: z.string().url("Invalid URL format").optional(),
    gender: z
      .enum(["male", "female"], {
        errorMap: () => ({
          message: "Gender must be either 'male' or 'female'",
        }),
      })
      .optional(),
    country: z.string().min(1, "Country cannot be empty").optional(),
    date_of_birth: z
      .string()
      .date("Invalid date format (YYYY-MM-DD)")
      .optional(),
    phone_number: z.string().min(1, "Phone number cannot be empty").optional(),
    age_range: z
      .enum(["13-18", "19-25", "26-35", "36-45", "46-60", "60+"])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["_all"],
  });

export class UserController {
  static async updateUser(c: Context) {
    try {
      const id = c.req.param("userId");
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

      const { id: currentUserId } = c.get("user");
      if (currentUserId !== id) {
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

      const updatedUser = await UserRepository.update(id, validatedData.data);

      return c.json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error in updateUser:", error);

      if (error instanceof Error) {
        if (error.message.includes("unique constraint")) {
          return c.json(
            {
              status: "error",
              message: "Email already in use by another account",
            },
            409,
          );
        }
      }

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

  static async getUserById(c: Context) {
    try {
      const id = c.req.param("userId");
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

      const appUser = await UserRepository.findById(id);
      if (!appUser) {
        return c.json(
          {
            status: "error",
            message: `User with ID ${id} not found`,
          },
          404,
        );
      }

      const { id: currentUserId } = c.get("user");
      if (currentUserId !== id) {
        const isAdmin = c.get("isAdmin") || false;
        if (!isAdmin) {
          return c.json(
            {
              status: "error",
              message:
                "You don't have permission to access this user's information",
            },
            403,
          );
        }
      }

      return c.json({
        status: "success",
        message: "User retrieved successfully",
        data: appUser,
      });
    } catch (error) {
      console.error("Error in getUserById:", error);

      return c.json(
        {
          status: "error",
          message: "Failed to retrieve user information",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }

  static async updateUserStatus(c: Context) {
    try {
      const { id: userId, email, storeId } = c.get("user");
      const { isOnline, lastSeen } = await c.req.json();

      // Fetch AppUser ID using storeId and email
      const appUser = await db
        .select({ id: AppUser.id })
        .from(AppUser)
        .where(
          and(
            eq(AppUser.id, userId),
            eq(AppUser.storeId, storeId),
            eq(AppUser.email, email),
          ),
        )
        .then((rows) => rows[0]);

      if (!appUser) {
        return c.json(
          {
            success: false,
            error: "AppUser not found",
          },
          404,
        );
      }

      const appUserId = appUser.id;

      // Update user status in database
      await db
        .update(AppUser)
        .set({
          is_online: isOnline,
          last_seen: lastSeen ? new Date(lastSeen) : new Date(),
        })
        .where(eq(AppUser.id, appUserId));

      // Initialize Pusher
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_APP_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      // Trigger Pusher event on public channel
      await pusher.trigger(`store-${storeId}`, "user-status-changed", {
        userId: appUserId, // Make sure this matches the string format expected
        isOnline,
        lastSeen: lastSeen || new Date().toISOString(), // Ensure proper date format
      });

      return c.json({
        success: true,
        message: "Status updated successfully",
      });
    } catch (error) {
      console.error("Failed to update user status:", error);
      return c.json(
        {
          success: false,
          error: "Failed to update user status",
        },
        500,
      );
    }
  }
}
