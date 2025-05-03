"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { QuickStartStepper } from "../stepper/quick-start-stepper";
import { AButton } from "../ui/animated-button";
import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";

function ConfigStepperContainer() {
    const { nextStep, prevStep } = useQuickStartStepperStore();
    return (
      <div className="h-full relative">
        <QuickStartStepper />
        <div className="absolute bottom-0 right-0 flex gap-2">
          <AButton
            onClick={prevStep}
            variant={"outline"}
            effect="expandIcon"
            icon={ArrowLeftIcon}
            iconPlacement="left"
          >
            Previous
          </AButton>
          <AButton
            onClick={nextStep}
            effect="expandIcon"
            icon={ArrowRightIcon}
            iconPlacement="right"
          >
            Next
          </AButton>
        </div>
      </div>
    );
}

export default ConfigStepperContainer;