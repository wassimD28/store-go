"use client";

import React from "react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/client/components/ui/stepper";

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

  // Calculate the current active step based on progress
  const getActiveStep = () => {
    if (progress >= 100) return 5;
    if (progress >= 80) return 4;
    if (progress >= 60) return 3;
    if (progress >= 30) return 2;
    if (progress >= 10) return 1;
    return 0;
  };

  // Define key stages in the build process
  const buildStages = [
    {
      step: 0,
      title: "Configuration",
      description: "Setting up build environment",
      completed: progress >= 10,
    },
    {
      step: 1,
      title: "Template Scanning",
      description: "Processing template files",
      completed: progress >= 30,
    },
    {
      step: 2,
      title: "Code Generation",
      description: "Creating application code",
      completed: progress >= 60,
    },
    {
      step: 3,
      title: "App Assets",
      description: "Icons & splash screen",
      completed: progress >= 78,
    },
    {
      step: 4,
      title: "APK Building",
      description: "Compiling and packaging",
      completed: progress >= 90,
    },
    {
      step: 5,
      title: "Upload & Complete",
      description: "Publishing and finalizing",
      completed: progress >= 100,
    },
  ];

  const activeStep = getActiveStep();

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

      {/* Build stage indicators using Stepper component */}
      <Stepper value={activeStep} className="mt-6 w-full justify-between">
        {buildStages.map((stage, index) => (
          <StepperItem
            key={index}
            step={stage.step}
            completed={stage.completed}
            disabled={status === "FAILED" && !stage.completed}
            loading={
              status === "IN_PROGRESS" &&
              activeStep === stage.step &&
              progress < 100
            }
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <StepperIndicator className="z-10" />

              <StepperTitle className="text-foreground/50">
                {stage.title}
              </StepperTitle>
            </div>

            {index < buildStages.length - 1 && (
              <StepperSeparator className="mx-4 flex-1" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
