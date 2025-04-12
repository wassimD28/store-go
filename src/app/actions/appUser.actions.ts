"use server";

import { db } from "@/lib/db/db";
import { AppUser } from "@/lib/db/schema";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { createClient } from "@supabase/supabase-js";
import { eq, and } from "drizzle-orm";

// Define a type that omits the password field from AppUser
type AppUserWithoutPassword = Omit<typeof AppUser.$inferSelect, "password">;

/**
 * Helper function to remove password from user data
 */
const excludePassword = (
  user: typeof AppUser.$inferSelect,
): AppUserWithoutPassword => {
  // Destructure to separate password from the rest of the user data
  const { ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get all app users for a specific store
 * @param storeId The ID of the store to get users for
 * @returns ActionResponse with array of app users (without passwords)
 */
export const getAppUsersByStoreId = async (
  storeId: string,
): Promise<ActionResponse<AppUserWithoutPassword[]>> => {
  try {
    // Query all app users that belong to the specified store
    const appUsers = await db.query.AppUser.findMany({
      where: eq(AppUser.storeId, storeId),
    });

    // Remove passwords from all users before returning
    const usersWithoutPasswords = appUsers.map(excludePassword);

    return {
      success: true,
      data: usersWithoutPasswords,
    };
  } catch (error) {
    console.error("Error fetching app users by store ID:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve app users",
    };
  }
};

/**
 * Get a specific app user by their ID
 * @param appUserId The ID of the app user to retrieve
 * @returns ActionResponse with the app user data (without password)
 */
export const getAppUserById = async (
  appUserId: string,
): Promise<ActionResponse<AppUserWithoutPassword>> => {
  try {
    // Find the app user that matches the provided ID
    const appUser = await db.query.AppUser.findFirst({
      where: eq(AppUser.id, appUserId),
    });

    if (!appUser) {
      return {
        success: false,
        error: "App user not found",
      };
    }

    // Remove password from user data
    const userWithoutPassword = excludePassword(appUser);

    return {
      success: true,
      data: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error fetching app user by ID:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve app user",
    };
  }
};

/**
 * Get an app user by their email address
 * @param email The email address to search for
 * @param storeId Optional store ID to narrow the search
 * @returns ActionResponse with the app user data (without password)
 */
export const getAppUserByEmail = async (
  email: string,
  storeId?: string,
): Promise<ActionResponse<AppUserWithoutPassword>> => {
  try {
    let appUser;

    if (storeId) {
      // If storeId is provided, search for user with matching email and store
      appUser = await db.query.AppUser.findFirst({
        where: and(eq(AppUser.email, email), eq(AppUser.storeId, storeId)),
      });
    } else {
      // Otherwise just search by email
      appUser = await db.query.AppUser.findFirst({
        where: eq(AppUser.email, email),
      });
    }

    if (!appUser) {
      return {
        success: false,
        error: "App user not found",
      };
    }

    // Remove password from user data
    const userWithoutPassword = excludePassword(appUser);

    return {
      success: true,
      data: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error fetching app user by email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve app user",
    };
  }
};

/**
 * Delete an app user by their ID from both the database and Supabase Auth
 * @param appUserId The ID of the app user to delete
 * @returns ActionResponse indicating success or failure
 */
export const deleteAppUser = async (
  appUserId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // Check if the app user exists before attempting to delete
    const existingUser = await db.query.AppUser.findFirst({
      where: eq(AppUser.id, appUserId),
    });

    if (!existingUser) {
      return {
        success: false,
        error: "App user not found",
      };
    }

    // Initialize Supabase admin client for auth operations
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );

    // Delete the user from Supabase Auth
    const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(
      appUserId
    );

    if (supabaseError) {
      console.error("Error deleting user from Supabase Auth:", supabaseError);
      return {
        success: false,
        error: `Failed to delete user from authentication system: ${supabaseError.message}`,
      };
    }

    // Delete the app user from the database
    await db.delete(AppUser).where(eq(AppUser.id, appUserId));

    return {
      success: true,
      data: { id: appUserId },
    };
  } catch (error) {
    console.error("Error deleting app user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete app user",
    };
  }
};

/**
 * Update an app user's information
 * @param appUserId The ID of the app user to update
 * @param userData The user data to update
 * @returns ActionResponse with the updated app user data (without password)
 */
export const updateAppUser = async (
  appUserId: string,
  userData: Partial<typeof AppUser.$inferInsert>,
): Promise<ActionResponse<AppUserWithoutPassword>> => {
  try {
    // Check if the app user exists before attempting to update
    const existingUser = await db.query.AppUser.findFirst({
      where: eq(AppUser.id, appUserId),
    });

    if (!existingUser) {
      return {
        success: false,
        error: "App user not found",
      };
    }

    // Update the app user with the provided data
    // Note: We don't want to allow updating certain fields like id or storeId
    const { ...updateData } = userData;

    // Add updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date(),
    };

    await db.update(AppUser).set(dataToUpdate).where(eq(AppUser.id, appUserId));

    // Fetch the updated user to return
    const updatedUser = await db.query.AppUser.findFirst({
      where: eq(AppUser.id, appUserId),
    });

    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to retrieve updated user",
      };
    }

    // Remove password from updated user data
    const userWithoutPassword = excludePassword(updatedUser);

    return {
      success: true,
      data: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error updating app user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update app user",
    };
  }
};

/**
 * Alternative approach: Using column selection with Drizzle ORM
 * This demonstrates how to select specific columns in your queries,
 * excluding the password field entirely
 */
export const getAppUserByIdAlt = async (
  appUserId: string,
): Promise<ActionResponse<Partial<typeof AppUser.$inferSelect>>> => {
  try {
    // Find the app user that matches the provided ID
    // Only select specific columns (excluding password)
    const appUser = await db
      .select({
        id: AppUser.id,
        storeId: AppUser.storeId,
        name: AppUser.name,
        email: AppUser.email,
        avatar: AppUser.avatar,
        gender: AppUser.gender,
        age_range: AppUser.age_range,
        auth_type: AppUser.auth_type,
        auth_provider: AppUser.auth_provider,
        provider_user_id: AppUser.provider_user_id,
        status: AppUser.status,
        created_at: AppUser.created_at,
        updated_at: AppUser.updated_at,
        // password is intentionally omitted
      })
      .from(AppUser)
      .where(eq(AppUser.id, appUserId))
      .then((rows) => rows[0]);

    if (!appUser) {
      return {
        success: false,
        error: "App user not found",
      };
    }

    return {
      success: true,
      data: appUser,
    };
  } catch (error) {
    console.error("Error fetching app user by ID:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve app user",
    };
  }
};
