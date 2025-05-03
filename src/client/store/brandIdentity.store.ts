import { create } from "zustand";

interface BrandIdentityStore {
  // Brand identity properties
  appName: string;
  appSlogan: string;
  appDescription: string;

  // Actions
  setAppName: (name: string) => void;
  setAppSlogan: (slogan: string) => void;
  setAppDescription: (description: string) => void;
  resetToDefaults: () => void;
}

// Default values
const defaultValues = {
  appName: "",
  appSlogan: "",
  appDescription: "",
};

export const useBrandIdentityStore = create<BrandIdentityStore>((set) => ({
  ...defaultValues,

  setAppName: (name: string) => set({ appName: name }),
  setAppSlogan: (slogan: string) => set({ appSlogan: slogan }),
  setAppDescription: (description: string) =>
    set({ appDescription: description }),
  resetToDefaults: () => set({ ...defaultValues }),
}));
