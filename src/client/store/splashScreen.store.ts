
import { create } from "zustand";

interface SplashScreenStore {
  // Light theme
  lightBackgroundColor: string;
  lightIconUrl: string;

  // Dark theme
  darkBackgroundColor: string;
  darkIconUrl: string;

  // Actions
  setLightBackgroundColor: (color: string) => void;
  setDarkBackgroundColor: (color: string) => void;
  setLightIconUrl: (url: string) => void;
  setDarkIconUrl: (url: string) => void;
  resetToDefaults: () => void;
}

// Default values
const defaultValues = {
  lightBackgroundColor: "#FFFFFF",
  darkBackgroundColor: "#1E1E1E",
  lightIconUrl: "",
  darkIconUrl: "",
};

export const useSplashScreenStore = create<SplashScreenStore>((set) => ({
  ...defaultValues,

  setLightBackgroundColor: (color: string) =>
    set({ lightBackgroundColor: color }),
  setDarkBackgroundColor: (color: string) =>
    set({ darkBackgroundColor: color }),
  setLightIconUrl: (url: string) => set({ lightIconUrl: url }),
  setDarkIconUrl: (url: string) => set({ darkIconUrl: url }),

  resetToDefaults: () => set({ ...defaultValues }),
}));
