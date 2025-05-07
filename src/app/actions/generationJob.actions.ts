"use server";

import { db } from "@/lib/db/db";
import { generationJob } from "@/lib/db/schema";
import { customStoreTemplate } from "@/lib/db/tables/store/customStoreTemplate.table";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/lib/types/interfaces/common.interface";
import Pusher from "pusher";

// Initialize Pusher
const pusherServer = (() => {
  try {
    // Check if all required variables are defined
    const appId = process.env.PUSHER_APP_ID!;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const secret = process.env.PUSHER_APP_SECRET!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    if (!appId || !key || !secret || !cluster) {
      console.warn(
        "Pusher environment variables are missing. Real-time notifications will be disabled.",
      );
      return null;
    }

    return new Pusher({
      appId,
      key,
      secret,
      cluster,
    });
  } catch (error) {
    console.error("Failed to initialize Pusher:", error);
    return null;
  }
})();

// Type for the generation job creation response
interface GenerationJobData {
  id: string;
  storeId: string;
  customStoreTemplateId: string;
  status: string;
  createdAt: Date;
}

/**
 * Trigger a new app generation job for a custom store template
 */
export const triggerAppGeneration = async (
  customTemplateId: string,
): Promise<ActionResponse<GenerationJobData>> => {
  try {
    // Get the custom template
    const template = await db.query.customStoreTemplate.findFirst({
      where: eq(customStoreTemplate.id, customTemplateId),
      with: {
        store: true,
        baseTemplate: true,
      },
    });

    if (!template) {
      return {
        success: false,
        error: "Custom store template not found",
      };
    }

    // Get the callback URL from environment variables, ensuring it's not undefined
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!appUrl) {
      throw new Error("appUrl environment variable is not defined");
    }

    // Make sure the template isn't already being built
    if (template.isBuilding) {
      return {
        success: false,
        error: "An app generation is already in progress for this template",
      };
    }

    // Update the template to indicate building is in progress
    await db
      .update(customStoreTemplate)
      .set({
        isBuilding: true,
        updatedAt: new Date(),
      })
      .where(eq(customStoreTemplate.id, customTemplateId));

    // Create a new generation job record
    const [newJob] = await db
      .insert(generationJob)
      .values({
        storeId: template.storeId,
        customStoreTemplateId: template.id,
        storeTemplateId: template.storeTemplateId,
        status: "PENDING",
        config: template.customTemplateConfig,
      })
      .returning();

    const callbackUrl = `${appUrl}/api/generation-callback`;

    // Trigger the GitHub Actions workflow
    await triggerGitHubWorkflow({
      jobId: newJob.id,
      storeId: template.storeId,
      callbackUrl,
      config: template.customTemplateConfig,
    });

    // Send a notification via Pusher
    if (pusherServer) {
      await pusherServer.trigger(
        `store-${template.storeId}`,
        "app-generation-started",
        {
          jobId: newJob.id,
          customTemplateId: template.id,
          message: "App generation started",
          status: "PENDING",
          timestamp: new Date().toISOString(),
        },
      );
    }

    return {
      success: true,
      data: newJob as GenerationJobData,
    };
  } catch (error) {
    console.error("Error triggering app generation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to trigger app generation",
    };
  }
};

/**
 * Trigger the GitHub Actions workflow via the GitHub API
 */
const triggerGitHubWorkflow = async ({
  jobId,
  storeId,
  callbackUrl,
  config,
}: {
  jobId: string;
  storeId: string;
  callbackUrl: string;
  config: unknown;
}) => {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const workflowId = process.env.GITHUB_WORKFLOW_ID;
  const token = process.env.GITHUB_API_TOKEN;

  if (!owner || !repo || !workflowId || !token) {
    throw new Error("Missing GitHub configuration environment variables");
  }

  // Log details for debugging
  console.log(`Triggering GitHub workflow with jobId: ${jobId}`);
  console.log(`Using callback URL: ${callbackUrl}`);

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main", // The branch or tag to run the workflow from
        inputs: {
          jobId,
          storeId,
          callbackUrl,
          config: JSON.stringify(config),
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to trigger GitHub workflow: ${errorText}`);
  }

  return true;
};

/**
 * Get the status of a generation job
 */
export const getGenerationJobStatus = async (jobId: string) => {
  try {
    const job = await db.query.generationJob.findFirst({
      where: eq(generationJob.id, jobId),
      with: {
        store: true,
        customStoreTemplate: true,
      },
    });

    if (!job) {
      return {
        success: false,
        error: "Generation job not found",
      };
    }

    return {
      success: true,
      job,
    };
  } catch (error) {
    console.error("Error fetching generation job status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get job status",
    };
  }
};

/**
 * List all generation jobs for a store
 */
export const getStoreGenerationJobs = async (storeId: string) => {
  try {
    const jobs = await db.query.generationJob.findMany({
      where: eq(generationJob.storeId, storeId),
      orderBy: (generationJob, { desc }) => [desc(generationJob.createdAt)],
      with: {
        customStoreTemplate: true,
        storeTemplate: true,
      },
    });

    return {
      success: true,
      jobs,
    };
  } catch (error) {
    console.error("Error fetching store generation jobs:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve generation jobs",
    };
  }
};
