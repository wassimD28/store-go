"use client";

import React, { use, useEffect, useState } from "react";
import {
  getStoreGenerationJobs,
} from "@/app/actions/generationJob.actions";
import { BuildProgress } from "@/client/components/live-build/build-progress";
import { LogViewer } from "@/client/components/live-build/log-viewer";
import Pusher from "pusher-js";
import { AButton } from "@/client/components/ui/animated-button";
import { Download } from "lucide-react";
import { cn, formatStatus } from "@/lib/utils";
import { Badge } from "@/client/components/ui/badge";

interface BuildLog {
  message: string;
  status: "PENDING" | "COMPLETED" | "IN_PROGRESS" | "FAILED";
  timestamp: string;
  progress: number;
  downloadUrl?: string;
}

export default function LiveBuildPage({params}: { params : Promise<{storeId: string}>}) {
    const resolvedParams = use(params);
    const { storeId } = resolvedParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<BuildLog["status"]>("PENDING");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the latest generation job for this store
  useEffect(() => {
    async function fetchLatestJob() {
      try {
        const response = await getStoreGenerationJobs(storeId);

        if (response.success && response.jobs && response.jobs.length > 0) {
          // Get the most recent job (should be first in the array since we order by createdAt desc)
          const latestJob = response.jobs[0];
          setCurrentJob(latestJob);
          setBuildStatus(latestJob.status);

          // If the job is already completed, set download URL
          if (latestJob.status === "COMPLETED" && latestJob.downloadUrl) {
            setDownloadUrl(latestJob.downloadUrl);
            setProgress(100);
          }

          // Add initial log entry based on job status
          const initialLog: BuildLog = {
            message: `App generation ${latestJob.status.toLowerCase()}`,
            status: latestJob.status,
            timestamp: new Date(latestJob.createdAt).toISOString(),
            progress:
              latestJob.status === "COMPLETED"
                ? 100
                : latestJob.status === "FAILED"
                  ? 0
                  : 5,
            downloadUrl: latestJob.downloadUrl || undefined,
          };

          setBuildLogs([initialLog]);
        } else {
          setError("No active build jobs found");
        }
      } catch (err) {
        console.error("Error fetching latest job:", err);
        setError("Failed to load build information");
      }
    }

    if (storeId) {
      fetchLatestJob();
    }
  }, [storeId]);

  // Connect to Pusher for real-time updates
  useEffect(() => {
    if (!storeId || !currentJob) return;

    // Initialize Pusher
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.error("Pusher environment variables not found");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    // Subscribe to the store's channel
    const channel = pusher.subscribe(`store-${storeId}`);

    // Listen for app generation updates
    channel.bind("app-generation-update", (data: BuildLog) => {
      console.log("Received build update:", data);

      // Update state with new data
      setBuildLogs((prevLogs) => [...prevLogs, data]);

      if (data.progress) {
        setProgress(data.progress);
      }

      if (data.status) {
        setBuildStatus(data.status);
      }

      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      }
    });

    // Listen for app generation started event
    channel.bind("app-generation-started", (data: BuildLog) => {
      console.log("App generation started:", data);
      setBuildLogs((prevLogs) => [...prevLogs, data]);
    });

    // Clean up on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [storeId, currentJob]);

  if (error) {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading build information...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">App Build Progress</h1>
        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium uppercase cursor-pointer",
              // Apply conditional styling based on status
              buildStatus === "COMPLETED" && "bg-green-500/5 text-green-500 border-green-500 hover:bg-green-500/10",
              buildStatus === "FAILED" && "bg-red-500/5 text-red-500 border-red-500 hover:bg-red-500/10",
              buildStatus == "PENDING" && "bg-yellow-500/5 text-yellow-500 border-yellow-500 hover:bg-yellow-500/10",
              buildStatus == "IN_PROGRESS" && "bg-blue-500/5 text-blue-500 border-blue-500 hover:bg-blue-500/10"
            )}
          >
            {formatStatus(buildStatus)}
          </Badge>

          {downloadUrl && (
            <a href={downloadUrl} download>
              <AButton
                effect={"expandIcon"}
                className="bg-primary/10 text-primary/90 hover:bg-primary/20 hover:text-primary"
                icon={Download}
                iconPlacement="right"
              >
                Download Apk
              </AButton>
            </a>
          )}
        </div>
      </div>

      <BuildProgress progress={progress} status={buildStatus} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <h2 className="mb-3 text-lg font-semibold">Build Logs</h2>
        <LogViewer logs={buildLogs} />
      </div>
    </div>
  );
}
