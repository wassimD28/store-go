
"use client";
import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";
import GlobalLayoutForm from "./previews/forms/globalLayoutForm";
import SplashScreenForm from "./previews/forms/splashScreenForm";

function CurrentConfigForm() {
  const { activeStep } = useQuickStartStepperStore();

  return (
    <div className="h-full overflow-hidden">
      {activeStep === 1 && <GlobalLayoutForm />}
      {activeStep === 2 && <SplashScreenForm />}
      {/* Add more forms for other steps as needed */}
    </div>
  );
}

export default CurrentConfigForm;
