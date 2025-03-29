"use server"

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/db";
import { stores } from "@/lib/db/schema";

// Interface to match your form's data structure
interface CreateStoreData {
  userId: string;
  name: string;
  logoUrl?: string;
  appUrl?: string;
}

export async function createStore({userId, name, logoUrl,appUrl}: CreateStoreData) {
  try {
    // Insert the new store into the database
    await db.insert(stores).values({
      userId,
      name,
      logoUrl: logoUrl ?? null,
      appUrl: appUrl ?? null,
    });


    // Revalidate the stores list page
    revalidatePath("/stores");

    // Return successful result
    return { success: true };
  } catch (error) {
    console.error("Failed to create store:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create store",
    };
  }
}
