"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { GenerationJobsTable } from "../tables/generationJobs.table";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { getStoreGenerationJobs } from "@/app/actions/generationJob.actions";

const ITEMS_PER_PAGE = 10;

export default function GenerationJobsTableContainer({
  storeId,
}: {
  storeId: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await getStoreGenerationJobs(storeId);
      if (response.success && response.jobs) {
        setJobs(response.jobs);
        setTotalPages(Math.ceil(response.jobs.length / ITEMS_PER_PAGE));
      } else {
        console.error("Failed to fetch jobs:", response.error);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
    // Auto-refresh has been removed as requested
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page's jobs
  const getCurrentJobs = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return jobs.slice(startIndex, endIndex);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">App Generation</h2>
          <p className="mt-1 text-muted-foreground">
            Generate and manage your store applications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchJobs}
            disabled={isLoading}
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Generation
          </Button>
        </div>
      </div>

      <GenerationJobsTable
        jobs={getCurrentJobs()}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
