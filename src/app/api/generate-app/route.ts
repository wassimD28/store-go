import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db/db";
import { generationJobs, stores } from "@/lib/db/schema";

// Create a jobs table with Drizzle if you want to persist jobs
// If not, you can continue using the Map as in your example

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeName, logoUrl, userId } = body;

    // Validate inputs
    if (!storeName) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      );
    }

    // Generate a unique job ID
    const jobId = uuidv4();
    const storeId = uuidv4(); // In a real app, this would come from your database

    // Store job information - either in memory or database
    // If using Drizzle, you'd insert into your jobs table instead
    // Example (assuming you have a jobs table defined with Drizzle):
    await db.insert(stores).values({
      id: storeId,
      userId,
      name: storeName,
      logoUrl,
      lastGeneratedAt: null,
    })

    await db.insert(generationJobs).values({
      id: jobId,
      storeId,
      status: "PENDING",
      config: JSON.stringify({ storeName, logoUrl }),
    });


    // Your domain for the callback
    const callbackUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/app-generation-callback`;

    // Make sure to update the GitHub repository URL to your own repository
    const response = await fetch(
      `https://api.github.com/repos/wassimD28/flutter-template/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "generate-app",
          client_payload: {
            jobId,
            storeId,
            storeName,
            logoUrl,
            callbackUrl,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to trigger app generation",
          details: errorText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: "App generation started",
    });
  } catch (error) {
    console.error("App generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start app generation",
      },
      { status: 500 }
    );
  }
}
