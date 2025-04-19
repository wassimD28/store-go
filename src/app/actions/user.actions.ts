"use server";

import { db } from "@/lib/db/db";
import { user } from "@/lib/db";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";

export const getUserById = async (
  userId: string,
): Promise<ActionResponse<typeof user.$inferSelect>> => {
  try {
    // Fetch the user that matches the provided ID
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve user",
    };
  }
};
