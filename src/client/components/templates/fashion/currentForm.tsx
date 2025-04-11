"use client";

import LoginForm from "./forms/login.form";
import OnBoardingForm from "./forms/onBoarding.form";
import { usePageSelectionStore } from "./stores/page-selection.store";

export function CurrentForm() {
  const { currentPage } = usePageSelectionStore();

  switch (currentPage) {
    case "onboarding":
      return <OnBoardingForm />;
    case "login":
      return <LoginForm />;
    default:
      return <OnBoardingForm />;
  }
}
