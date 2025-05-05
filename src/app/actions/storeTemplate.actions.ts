/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { storeTemplate } from "@/lib/db/tables/store/storeTemplate.table";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq } from "drizzle-orm";

// Define a type for the store template data based on your schema
interface StoreTemplateData {
  id: string;
  userId: string;
  name: string;
  storeType: "fashion" | "electronic"; // Values from storeTemplateTypeEnum
  templateConfig: Record<string, any>;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Get all store templates
 */
export const getStoreTemplates = async () => {
  try {
    const templates = await db.query.storeTemplate.findMany();
    return { success: true, templates };
  } catch (error) {
    console.error("Error fetching store templates:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve store templates",
    };
  }
};

/**
 * Get a specific store template by ID
 */
export const getStoreTemplateById = async (templateId: string) => {
  try {
    const template = await db.query.storeTemplate.findFirst({
      where: eq(storeTemplate.id, templateId),
    });

    if (!template) {
      return {
        success: false,
        error: "Store template not found",
      };
    }

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error("Error fetching store template by ID:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve store template",
    };
  }
};

/**
 * Create a new store template
 */
export const createStoreTemplate = async ({
  userId,
  storeType,
  name,
  templateConfig = {},
}: {
  userId: string;
  storeType: "fashion" | "electronic";
  name: string;
  templateConfig?: Record<string, any>;
}): Promise<ActionResponse<StoreTemplateData>> => {
  try {
    // Validate that storeType is one of the allowed enum values
    if (storeType !== "fashion" && storeType !== "electronic") {
      return {
        success: false,
        error: "Invalid store type. Must be either 'fashion' or 'electronic'",
      };
    }

    const [newTemplate] = await db
      .insert(storeTemplate)
      .values({
        userId,
        name,
        storeType: storeType as any, // Cast to any to satisfy TypeScript
        templateConfig,
      })
      .returning();

    return { success: true, data: newTemplate as StoreTemplateData };
  } catch (error) {
    console.error("Error creating store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create store template",
    };
  }
};

/**
 * Update an existing store template
 */
export const updateStoreTemplate = async ({
  id,
  storeType,
  templateConfig,
}: {
  id: string;
  storeType?: "fashion" | "electronic";
  templateConfig?: Record<string, any>;
}): Promise<ActionResponse<StoreTemplateData>> => {
  try {
    // Check if the template exists
    const existingTemplate = await db.query.storeTemplate.findFirst({
      where: eq(storeTemplate.id, id),
    });

    if (!existingTemplate) {
      return {
        success: false,
        error: "Store template not found",
      };
    }

    // Validate store type if provided
    if (
      storeType !== undefined &&
      storeType !== "fashion" &&
      storeType !== "electronic"
    ) {
      return {
        success: false,
        error: "Invalid store type. Must be either 'fashion' or 'electronic'",
      };
    }

    // Build update data object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (storeType !== undefined) {
      updateData.storeType = storeType;
    }

    if (templateConfig !== undefined) {
      updateData.templateConfig = templateConfig;
    }

    const [updatedTemplate] = await db
      .update(storeTemplate)
      .set(updateData)
      .where(eq(storeTemplate.id, id))
      .returning();

    return { success: true, data: updatedTemplate as StoreTemplateData };
  } catch (error) {
    console.error("Error updating store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update store template",
    };
  }
};

/**
 * Delete a store template
 */
export const deleteStoreTemplate = async (
  templateId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // You might want to check for any custom templates that reference this template
    // before deletion, similar to the category deletion check

    const [deletedTemplate] = await db
      .delete(storeTemplate)
      .where(eq(storeTemplate.id, templateId))
      .returning({ id: storeTemplate.id });

    if (!deletedTemplate) {
      return {
        success: false,
        error: "Store template not found",
      };
    }

    return {
      success: true,
      data: { id: deletedTemplate.id },
    };
  } catch (error) {
    console.error("Error deleting store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete store template",
    };
  }
};
