"use client";

import LoginScreen from "./screens/login.screen";
import OnBoardingScreen from "./screens/onBoarding.screen";
import { usePageSelectionStore } from "./stores/page-selection.store";

export function CurrentScreen() {
  const { currentPage } = usePageSelectionStore();

  switch (currentPage) {
    case "onboarding":
      return <OnBoardingScreen />;
    case "login":
      return <LoginScreen />;
    default:
      return <OnBoardingScreen />;
  }
}
