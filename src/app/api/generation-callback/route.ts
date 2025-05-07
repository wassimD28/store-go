/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/lib/db/db";
import { eq } from "drizzle-orm";
import { generationJob, stores } from "@/lib/db/schema";
import { customStoreTemplate } from "@/lib/db/tables/store/customStoreTemplate.table";
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

// Create a Hono app for the generation callback
const app = new Hono().basePath("/api/mobile-app/generation-callback");

// Endpoint to receive build status updates from GitHub Actions
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { jobId, status, downloadUrl, progress, message } = body;

    // Validate request
    if (!jobId || !status) {
      return c.json({ error: "Invalid callback data" }, 400);
    }

    console.log(`Received callback for job ${jobId} with status: ${status}`);

    // Get the job from the database
    const [job] = await db
      .select()
      .from(generationJob)
      .where(eq(generationJob.id, jobId));

    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }

    // Get the store ID to use for Pusher channel
    const storeId = job.storeId;

    // Update job status in the database
    const updateData: Record<string, any> = { status };

    // Add download URL if provided
    if (downloadUrl) {
      updateData.downloadUrl = downloadUrl;
    }

    // Always set completedAt when receiving a terminal status
    if (status === "COMPLETED" || status === "FAILED") {
      updateData.completedAt = new Date();

      // Always update the custom template to indicate building is complete
      if (job.customStoreTemplateId) {
        await db
          .update(customStoreTemplate)
          .set({
            isBuilding: false,
            isBuilt: status === "COMPLETED",
            updatedAt: new Date(),
          })
          .where(eq(customStoreTemplate.id, job.customStoreTemplateId));
      }

      // Only update store record if completed successfully with a download URL
      if (status === "COMPLETED" && downloadUrl) {
        await db
          .update(stores)
          .set({
            appUrl: downloadUrl,
            lastGeneratedAt: new Date(),
          })
          .where(eq(stores.id, storeId));
      }
    }

    // Update the job record
    await db
      .update(generationJob)
      .set(updateData)
      .where(eq(generationJob.id, jobId));

    // Send real-time update via Pusher if available
    if (pusherServer) {
      await pusherServer.trigger(`store-${storeId}`, "app-generation-update", {
        jobId,
        status,
        message: message || `App build ${status.toLowerCase()}`,
        progress: progress || (status === "COMPLETED" ? 100 : 0),
        downloadUrl: downloadUrl || undefined,
        timestamp: new Date().toISOString(),
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Callback processing error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to process callback",
      },
      500,
    );
  }
});
// Export the handlers
export const POST = handle(app);
