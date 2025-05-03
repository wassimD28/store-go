"use client";
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

const steps = [
  {
    step: 1,
    title: "Global Layout",
    description: "Set colors for light/dark modes and border radius",
  },
  {
    step: 2,
    title: "Splash Screen",
    description: "Design your app's loading screen",
  },
  {
    step: 3,
    title: "Brand Identity",
    description: "Upload logo and brand assets",
  },
];

function QuickStartStepper() {
  const { setActiveStep, activeStep } = useQuickStartStepperStore();

  return (
    <Stepper
      value={activeStep}
      onValueChange={setActiveStep}
      orientation="vertical"
    >
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
                  "text-xs transition-opacity duration-200",
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
