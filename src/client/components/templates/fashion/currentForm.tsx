"use client";

import LoginForm from "./forms/login.form";
import OnBoardingForm from "./forms/onBoarding.form";
import HomeForm from "./forms/home.form";
import { usePageSelectionStore } from "./stores/page-selection.store";

export function CurrentForm() {
  const { currentPage } = usePageSelectionStore();

  switch (currentPage) {
    case "onboarding":
      return <OnBoardingForm />;
    case "login":
      return <LoginForm />;
    case "home":
      return <HomeForm />;
    default:
      return <OnBoardingForm />;
  }
}