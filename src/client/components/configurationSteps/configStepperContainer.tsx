"use client";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { QuickStartStepper } from "../stepper/quick-start-stepper";
import { AButton } from "../ui/animated-button";
import { useQuickStartStepperStore } from "@/client/store/quickStartStepper.store";
import { createCustomStoreTemplate } from "@/app/actions/customStoreTemplate.actions";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useBrandIdentityStore } from "@/client/store/brandIdentity.store";
import { useGlobalLayout } from "@/client/store/globalLayout.store";
import { useSplashScreenStore } from "@/client/store/splashScreen.store";
import { useRouter } from "next/navigation";
import { QuickBuildConfig } from "@/lib/types/interfaces/quickBuildConfig.interface";

interface ConfigStepperContainerProps {
  storeId: string;
  templateId: string;
  type: "fashion" | "shoes" | "electronic";
}
function ConfigStepperContainer({
  storeId,
  templateId: storeTemplateId,
  type,
}: ConfigStepperContainerProps) {
  const { nextStep, prevStep, activeStep,setActiveStep } = useQuickStartStepperStore();
  // store generation data
  const { appName, appDescription, appSlogan,resetToDefaults:restBrandIdentityStore } = useBrandIdentityStore();
  const { getLightColors, getDarkColors, radius,resetToDefaults:resetGlobalLayoutStore } = useGlobalLayout();
  const {
    darkBackgroundColor,
    darkIconUrl,
    lightBackgroundColor,
    lightIconUrl,
  } = useSplashScreenStore();
  const { data } = authClient.useSession();
  const router = useRouter();
  const isFirstStep = activeStep === 1;
  const isLastStep = activeStep === 3; // Assuming 3 is the last step

  // Handle finish action when the last step is completed
  const handleFinish = async () => {
    try {
      
      // console log both storeId and storeTemplateId
      console.log("Store ID:", storeId);
      console.log("Store Template ID:", storeTemplateId);
      toast.loading("Creating custom store template...", {
        id: `creating-template-${storeId}`,
      });
      // check if user is logged in
      if (!data?.session.userId) {
        console.error("User id required to create a custom store template.");
        toast.error("User id required to create a custom store template.", {
          id: `creating-template-${storeId}`,
        });
        return;
      }
      // check if store data except colors if they are not set
      if (!appName || !appDescription || !appSlogan) {
        console.error(
          "Brand identity data is required to create a custom store template.",
        );
        toast.error(
          "Brand identity data is required to create a custom store template.",
          {
            id: `creating-template-${storeId}`,
          },
        );
        return;
      }
      // check if splash screen data is required to create a custom store template.
      if (
        !darkBackgroundColor ||
        !darkIconUrl ||
        !lightBackgroundColor ||
        !lightIconUrl
      ) {
        console.error(
          "Splash screen data is required to create a custom store template.",
        );
        toast.error(
          "Splash screen data is required to create a custom store template.",
          {
            id: `creating-template-${storeId}`,
          },
        );
        return;
      }
      // check if radius is required to create a custom store template.
      if (radius === undefined) {
        console.error("Radius is required to create a custom store template.");
        toast.error("Radius is required to create a custom store template.", {
          id: `creating-template-${storeId}`,
        });
        return;
      }
      // check if colors are required to create a custom store template.
      const lightColors = getLightColors();
      const darkColors = getDarkColors();
      if (!lightColors || !darkColors) {
        console.error("Colors are required to create a custom store template.");
        toast.error("Colors are required to create a custom store template.", {
          id: `creating-template-${storeId}`,
        });
        return;
      }
      const storeConfig: QuickBuildConfig = {
        buildType: "quick_build",
        baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        storeId,
        appName,
        appDescription,
        appSlogan,
        type,
        radius,
        lightColors,
        darkColors,
        lightIconUrl,
        darkIconUrl,
        splashScreen: {
          lightBackgroundColor,
          darkBackgroundColor,
        },
      };
      const result = await createCustomStoreTemplate({
        storeId,
        storeTemplateId,
        name: appName,
        builtType: "quick_build",
        userId: data.session.userId,
        customTemplateConfig: storeConfig,
      });
      // Check if the operation was successful
      if (!result.success) {
        console.error("Server returned error:", result.error);
        toast.error(`Failed: ${result.error}`, {
          id: `creating-template-${storeId}`,
        });
        return;
      }
      toast.success("Custom store template created successfully.", {
        id: `creating-template-${storeId}`,
      });
      router.push(`/stores/${storeId}/templates/customizations`);
      // Reset to defaults after creating the template
      resetGlobalLayoutStore();
      restBrandIdentityStore();
      setActiveStep(1); // Reset to the first step
    } catch (error) {
      toast.error("Failed to create custom store template.", {
        id: `creating-template-${storeId}`,
      });
      console.error("Error creating custom store template:", error);
    }
  };

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
        {isLastStep ? (
          <AButton
            onClick={handleFinish}
            effect="expandIcon"
            icon={CheckIcon}
            iconPlacement="right"
          >
            Save
          </AButton>
        ) : (
          <AButton
            onClick={nextStep}
            effect="expandIcon"
            icon={ArrowRightIcon}
            iconPlacement="right"
          >
            Next
          </AButton>
        )}
      </div>
    </div>
  );
}

export default ConfigStepperContainer;
