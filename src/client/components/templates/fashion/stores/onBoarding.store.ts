import { ButtonElement, TextElement } from "@/lib/types/interfaces/storeGoElements.interface";
import { create } from "zustand"; // Added the import for create

interface OnBoardingPageStore {
  title: TextElement;
  button: ButtonElement;
  updateTitle: (title: TextElement) => void;
  updateButton: (button: ButtonElement) => void;
}

export const useOnBoardingPageStore = create<OnBoardingPageStore>((set) => ({
  // Initialize with default values
  title: {
    text: "Welcome to Onboarding",
    textColor: "#032666",
  },
  button: {
    text: "Get Started",
    textColor: "#FFFFFF",
    backgroundColor: "#032666",
    radius: "none",
  },
  updateTitle: (title) =>
    set((state) => ({
      title: { ...state.title, ...title },
    })),

  updateButton: (button) =>
    set((state) => ({
      button: { ...state.button, ...button },
    })),
}));
