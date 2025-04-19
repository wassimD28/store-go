import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { eq } from "drizzle-orm";
import { generationJobs, stores } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, status, downloadUrl } = body;

    // Validate request
    if (!jobId || !status) {
      return NextResponse.json(
        { error: "Invalid callback data" },
        { status: 400 },
      );
    }

    // Get the job from the database
    const [job] = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, jobId));

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job status in the database
    await db
      .update(generationJobs)
      .set({
        status: status,
        completedAt: new Date(),
        downloadUrl: downloadUrl,
      })
      .where(eq(generationJobs.id, jobId));

    // Also update the store record
    await db
      .update(stores)
      .set({
        appUrl: downloadUrl,
        lastGeneratedAt: new Date(),
      })
      .where(eq(stores.id, job.storeId));

    console.log(`Job ${jobId} completed with status: ${status}`);
    console.log(`Download URL: ${downloadUrl}`);

    // Could also implement notification logic here
    // (email, in-app notification, etc.)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process callback",
      },
      { status: 500 },
    );
  }
}
