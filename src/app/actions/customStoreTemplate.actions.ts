/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db/db";
import { customStoreTemplate } from "@/lib/db/tables/store/customStoreTemplate.table";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import { eq, and } from "drizzle-orm";

// Define a type for the custom store template data based on your schema
interface CustomStoreTemplateData {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  storeTemplateId: string;
  customTemplateConfig: Record<string, any>;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Get all custom store templates for a specific store
 */
export const getCustomStoreTemplates = async (storeId: string) => {
  try {
    const templates = await db.query.customStoreTemplate.findMany({
      where: eq(customStoreTemplate.storeId, storeId),
      with: {
        baseTemplate: true, // Include the related base template data
      },
    });
    return { success: true, templates };
  } catch (error) {
    console.error("Error fetching custom store templates:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve custom store templates",
    };
  }
};

/**
 * Get a specific custom store template by ID
 */
export const getCustomStoreTemplateById = async (templateId: string) => {
  try {
    const template = await db.query.customStoreTemplate.findFirst({
      where: eq(customStoreTemplate.id, templateId),
      with: {
        baseTemplate: true, // Include the related base template
        store: true, // Include the related store data
      },
    });

    if (!template) {
      return {
        success: false,
        error: "Custom store template not found",
      };
    }

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error("Error fetching custom store template by ID:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve custom store template",
    };
  }
};

/**
 * Create a new custom store template
 */
export const createCustomStoreTemplate = async ({
  userId,
  storeId,
  name,
  storeTemplateId,
  customTemplateConfig = {},
}: {
  userId: string;
  storeId: string;
  name: string;
  storeTemplateId: string;
  customTemplateConfig?: Record<string, any>;
}): Promise<ActionResponse<CustomStoreTemplateData>> => {
  try {
    // Check if a custom template already exists for this store and base template
    const existingTemplate = await db.query.customStoreTemplate.findFirst({
      where: and(
        eq(customStoreTemplate.storeId, storeId),
        eq(customStoreTemplate.storeTemplateId, storeTemplateId),
      ),
    });

    if (existingTemplate) {
      return {
        success: false,
        error:
          "A custom template for this store and base template already exists",
      };
    }

    const [newTemplate] = await db
      .insert(customStoreTemplate)
      .values({
        userId,
        storeId,
        name,
        storeTemplateId,
        customTemplateConfig,
      })
      .returning();

    return { success: true, data: newTemplate as CustomStoreTemplateData };
  } catch (error) {
    console.error("Error creating custom store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create custom store template",
    };
  }
};

/**
 * Update an existing custom store template
 */
export const updateCustomStoreTemplate = async ({
  id,
  customTemplateConfig,
}: {
  id: string;
  customTemplateConfig: Record<string, any>;
}): Promise<ActionResponse<CustomStoreTemplateData>> => {
  try {
    // Check if the template exists
    const existingTemplate = await db.query.customStoreTemplate.findFirst({
      where: eq(customStoreTemplate.id, id),
    });

    if (!existingTemplate) {
      return {
        success: false,
        error: "Custom store template not found",
      };
    }

    const [updatedTemplate] = await db
      .update(customStoreTemplate)
      .set({
        customTemplateConfig,
        updatedAt: new Date(),
      })
      .where(eq(customStoreTemplate.id, id))
      .returning();

    return { success: true, data: updatedTemplate as CustomStoreTemplateData };
  } catch (error) {
    console.error("Error updating custom store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update custom store template",
    };
  }
};

/**
 * Delete a custom store template
 */
export const deleteCustomStoreTemplate = async (
  templateId: string,
): Promise<ActionResponse<{ id: string }>> => {
  try {
    const [deletedTemplate] = await db
      .delete(customStoreTemplate)
      .where(eq(customStoreTemplate.id, templateId))
      .returning({ id: customStoreTemplate.id });

    if (!deletedTemplate) {
      return {
        success: false,
        error: "Custom store template not found",
      };
    }

    return {
      success: true,
      data: { id: deletedTemplate.id },
    };
  } catch (error) {
    console.error("Error deleting custom store template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete custom store template",
    };
  }
};

/**
 * Get a custom store template by store and base template IDs
 */
export const getCustomTemplateByStoreAndTemplate = async (
  storeId: string,
  storeTemplateId: string,
) => {
  try {
    const template = await db.query.customStoreTemplate.findFirst({
      where: and(
        eq(customStoreTemplate.storeId, storeId),
        eq(customStoreTemplate.storeTemplateId, storeTemplateId),
      ),
      with: {
        baseTemplate: true,
      },
    });

    if (!template) {
      return {
        success: false,
        error:
          "Custom template not found for this store and template combination",
      };
    }

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error("Error fetching custom template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve custom template",
    };
  }
};
