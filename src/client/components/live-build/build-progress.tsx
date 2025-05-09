"use client";

import React from "react";

interface BuildProgressProps {
  progress: number;
  status: "PENDING" | "COMPLETED" | "IN_PROGRESS" | "FAILED";
}

export function BuildProgress({ progress, status }: BuildProgressProps) {
  // Format progress for display
  const formattedProgress = Math.min(Math.max(0, progress), 100);

  // Define color based on status
  const getColorClasses = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  // Define key stages in the build process
  const buildStages = [
    { label: "Configuration", percent: 10, complete: progress >= 10 },
    { label: "Template Scanning", percent: 30, complete: progress >= 30 },
    { label: "Code Generation", percent: 60, complete: progress >= 60 },
    { label: "APK Building", percent: 90, complete: progress >= 90 },
    { label: "Upload & Complete", percent: 100, complete: progress >= 100 },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="h-4 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClasses()}`}
          style={{ width: `${formattedProgress}%` }}
        />
      </div>

      {/* Progress percentage and status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/50">
          {formattedProgress}% Complete
        </span>
        <span className="text-sm font-medium text-foreground/50">
          {status === "PENDING"
            ? "Waiting to start..."
            : status === "IN_PROGRESS"
              ? "Building..."
              : status === "COMPLETED"
                ? "Build completed"
                : "Build failed"}
        </span>
      </div>

      {/* Build stage indicators */}
      <div className="flex justify-between items-center pt-4">
        {buildStages.map((stage, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
          >
            <div
              className={`mb-2 flex h-5 w-5 items-center justify-center rounded-full ${stage.complete ? getColorClasses() : "bg-foreground/50"}`}
            >
              {stage.complete && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-background"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-foreground/50">{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
