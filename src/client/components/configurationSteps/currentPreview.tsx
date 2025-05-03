"use client"

import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";
import { cn } from "@/lib/utils";
import GlobalLayoutPreview from "./previews/globalLyoutPreview";
import SplashScreenPreview from "./previews/splashScreenPreview";
import BrandIdentityPreview from "./previews/brandIdentityPreview";

function CurrentPreview() {
    const {activeStep} = useQuickStartStepperStore()
  return (
    <div className="h-full overflow-hidden rounded-lg">
      <div
        className={cn(
            // height should be 100% * steps length
            // translate-y should be -100% / steps length * current step
          "flex h-[300%] flex-col transition-all duration-300 ease-in-out",
          activeStep == 2 && "-translate-y-[calc((100%/3)*1)]",
          activeStep == 3 && "-translate-y-[calc((100%/3)*2)]",
        )}
      >
        <GlobalLayoutPreview />
        <SplashScreenPreview />
        <BrandIdentityPreview/>
      </div>
    </div>
  );
}

export default CurrentPreview;
