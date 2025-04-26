
"use client";

import { use } from "react"; // Import the use hook
import MobilePreview from "@/client/components/templates/mobilePreview";
import PagePreview from "@/client/components/templates/pagePreview";
import { CurrentForm } from "@/client/components/templates/fashion/currentForm";
import { CurrentScreen } from "@/client/components/templates/fashion/currentScreen";
import OnBoardingScreen from "@/client/components/templates/fashion/screens/onBoarding.screen";
import LoginScreen from "@/client/components/templates/fashion/screens/login.screen";

interface Props {
  params: Promise<{ storeId: string }> | { storeId: string }; // Updated type to handle both current and future cases
}

function Preview({ params }: Props) {
  // Unwrap the params using React.use()
  const resolvedParams = use(params as Promise<{ storeId: string }>);
  const { storeId } = resolvedParams; // todo : use this later

  return (
    <div className="grid h-full w-full grid-cols-[1fr_auto_auto] gap-3 overflow-hidden px-2 text-2xl">
      <div className="h-full overflow-y-scroll pr-4 pl-2">
        <CurrentForm />
      </div>
      <div className="flex-center h-full w-[310px] overflow-hidden 2xl:w-[500px]">
        <MobilePreview>
          <CurrentScreen />
        </MobilePreview>
      </div>
      <div className="flex h-full w-[100px] flex-col gap-2 overflow-y-scroll py-2">
        <PagePreview pageType="onboarding">
          <OnBoardingScreen />
        </PagePreview>
        <PagePreview pageType="login">
          <LoginScreen />
        </PagePreview>
      </div>
    </div>
  );
}

export default Preview;
