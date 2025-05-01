"use client";
import { use } from "react";
import MobilePreview from "@/client/components/templates/mobilePreview";
import PagePreview from "@/client/components/templates/pagePreview";
import { CurrentForm } from "@/client/components/templates/fashion/currentForm";
import { CurrentScreen } from "@/client/components/templates/fashion/currentScreen";
import OnBoardingScreen from "@/client/components/templates/fashion/screens/onBoarding.screen";
import LoginScreen from "@/client/components/templates/fashion/screens/login.screen";
import HomeScreen from "@/client/components/templates/fashion/screens/home.screen";

// Define the type to match what Next.js expects
export default function Preview({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  // Use the React.use hook to unwrap the Promise
  const resolvedParams = use(params);
  const { storeId } = resolvedParams;

  return (
    <div className="grid h-full w-full grid-cols-[1fr_auto_auto] gap-3 overflow-hidden px-2 text-2xl">
      <div className="h-full overflow-y-scroll pl-2 pr-4">
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
        <PagePreview pageType="home">
          <HomeScreen />
        </PagePreview>
      </div>
    </div>
  );
}
