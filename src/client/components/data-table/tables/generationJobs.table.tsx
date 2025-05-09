"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Download, ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { Button } from "@/client/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { Badge } from "@/client/components/ui/badge";
import { Skeleton } from "@/client/components/ui/skeleton";
import { GenerationJobsEmptyState } from "../empty-states/generation-jobs-empty-state";

// Types based on your database schema
type GenerationJob = {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: Date;
  completedAt: Date | null;
  downloadUrl: string | null;
  customStoreTemplate: {
    id: string;
    name: string;
  };
  storeTemplate: {
    id: string;
    name: string;
  };
};

interface GenerationJobsTableProps {
  jobs: GenerationJob[];
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

export function GenerationJobsTable({
  jobs,
  isLoading = false,
  onPageChange,
  currentPage,
  totalPages,
}: GenerationJobsTableProps) {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Function to get status badge
  const getStatusBadge = (status: GenerationJob["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="flex-center border-yellow-500 bg-yellow-500/5 text-yellow-500"
          >
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="flex-center border-blue-500 bg-blue-500/5 text-blue-500"
          >
            Processing
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="flex-center border-green-500 bg-green-500/5 text-green-700"
          >
            Completed
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="flex-center border-red-500 bg-red-500/5 text-red-500"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Show empty state if no jobs and not loading
  if (jobs.length === 0 && !isLoading) {
    return <GenerationJobsEmptyState />;
  }

  return (
    <div className="rounded-md border bg-card">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] truncate pl-6">
                Template
              </TableHead>
              <TableHead>Base Template</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead
                className="w-[180px] cursor-pointer"
                onClick={toggleSort}
              >
                <div className="flex items-center">
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[180px]">Completed</TableHead>
              <TableHead className="w-[80px] text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? // Skeleton rows for loading state
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-36" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-9 w-9" />
                      </TableCell>
                    </TableRow>
                  ))
              : jobs.map((job) => (
                  <TableRow className="px-4" key={job.id}>
                    <TableCell className="pl-6 font-medium">
                      {job.customStoreTemplate.name}
                    </TableCell>
                    <TableCell>{job.storeTemplate.name}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {formatDistanceToNow(new Date(job.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(job.createdAt).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {job.completedAt ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                {formatDistanceToNow(
                                  new Date(job.completedAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {new Date(job.completedAt).toLocaleString()}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {job.status === "COMPLETED" && job.downloadUrl ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" asChild>
                                <a
                                  href={job.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download app</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Only show if there are jobs */}
      {jobs.length > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
