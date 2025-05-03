"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { QuickStartStepper } from "../stepper/quick-start-stepper";
import { AButton } from "../ui/animated-button";
import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";

function ConfigStepperContainer() {
  const { nextStep, prevStep, activeStep } =
    useQuickStartStepperStore();

  // Add totalSteps to the store if it doesn't exist
  const isFirstStep = activeStep === 1;
  const isLastStep = activeStep === 3; // Assuming 3 is the last step, or use totalSteps if implemented

  return (
    <div className="relative h-full">
      <QuickStartStepper />
      <div className="absolute bottom-0 right-0 flex gap-2">
        <AButton
          onClick={prevStep}
          variant={"outline"}
          effect="expandIcon"
          icon={ArrowLeftIcon}
          iconPlacement="left"
          disabled={isFirstStep}
        >
          Previous
        </AButton>
        <AButton
          onClick={nextStep}
          effect="expandIcon"
          icon={ArrowRightIcon}
          iconPlacement="right"
          disabled={isLastStep}
        >
          Next
        </AButton>
      </div>
    </div>
  );
}

export default ConfigStepperContainer;