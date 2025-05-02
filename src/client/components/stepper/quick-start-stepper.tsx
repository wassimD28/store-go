"use client"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/client/components/ui/stepper";
import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const steps = [
  {
    step: 1,
    title: "Layout Configuration",
    description:
      "Set up your application's structure and responsive design patterns",
  },
  {
    step: 2,
    title: "Theme Customization",
    description:
      "Define your brand colors, typography, and visual styling elements",
  },
  {
    step: 3,
    title: "Splash Screen Design",
    description: "Create an engaging initial loading experience for your users",
  },
  {
    step: 4,
    title: "Brand Identity",
    description: "Upload and configure your company logo and brand assets",
  },
];

function QuickStartStepper() {
  const { setActiveStep, activeStep } = useQuickStartStepperStore();
  useEffect(() => {
    if(activeStep){
      console.log("active step has changed to :", activeStep)
    }

  }, [activeStep]);
  return (
    <Stepper value={activeStep} onValueChange={setActiveStep} orientation="vertical">
      {steps.map(({ step, title, description }) => (
        <StepperItem
          key={step}
          step={step}
          className="relative items-start [&:not(:last-child)]:flex-1"
        >
          <StepperTrigger className="items-start pb-12 last:pb-0">
            <StepperIndicator />
            <div className="mt-0.5 space-y-0.5 px-2 text-left">
              <StepperTitle>{title}</StepperTitle>
              <StepperDescription
                className={cn(
                  "transition-opacity duration-200 text-xs",
                  "group-data-[state=active]/step:opacity-100",
                  "group-data-[state=inactive]/step:opacity-0",
                  "group-data-[state=completed]/step:opacity-0",
                )}
              >
                {description}
              </StepperDescription>
            </div>
          </StepperTrigger>
          {step < steps.length && (
            <StepperSeparator className="absolute inset-y-0 left-3 top-[calc(1.5rem+0.125rem)] -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
          )}
        </StepperItem>
      ))}
    </Stepper>
  );
}

export { QuickStartStepper };
