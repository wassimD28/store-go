import { create } from "zustand";

interface GlobalLayoutStore {
  radius: 0 | 5 | 10 | 15 | 20 | 100;
  // Background colors
  bgColor: string;
  foregroundColor: string;
  // Card colors
  cardColor: string;
  cardForegroundColor: string;
  // Text colors
  textColor: string;
  // Primary colors
  primaryColor: string;
  primaryForegroundColor: string;
  // Secondary colors
  secondaryColor: string;
  secondaryForegroundColor: string;
  // Accent colors
  accentColor: string;
  accentForegroundColor: string;
  // Muted colors
  mutedColor: string;
  mutedForegroundColor: string;
  // Input and border colors
  inputColor: string;
  borderColor: string;
  // Destructive colors
  destructiveColor: string;
  destructiveForegroundColor: string;

  // Setters
  setBgColor: (color: string) => void;
  setForegroundColor: (color: string) => void;
  setCardColor: (color: string) => void;
  setCardForegroundColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setPrimaryColor: (color: string) => void;
  setPrimaryForegroundColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setSecondaryForegroundColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setAccentForegroundColor: (color: string) => void;
  setMutedColor: (color: string) => void;
  setMutedForegroundColor: (color: string) => void;
  setInputColor: (color: string) => void;
  setBorderColor: (color: string) => void;
  setDestructiveColor: (color: string) => void;
  setDestructiveForegroundColor: (color: string) => void;
  setRadius: (radius: 0 | 5 | 10 | 15 | 20 | 100) => void;
}

export const useGlobalLayout = create<GlobalLayoutStore>((set) => ({
  radius: 10,
  bgColor: "#FFFFFF",
  foregroundColor: "#000000",
  primaryColor: "#000000",
  primaryForegroundColor: "#FFFFFF",
  secondaryColor: "#F5F5F5",
  secondaryForegroundColor: "#111111",
  accentColor: "#EC4899",
  accentForegroundColor: "#FFFFFF",
  mutedColor: "#8B8B8B",
  mutedForegroundColor: "#737373",
  cardColor: "#FFFFFF",
  cardForegroundColor: "#000000",
  borderColor: "#E5E5E5",
  inputColor: "#F4F4F4",
  destructiveColor: "#FF0000",
  destructiveForegroundColor: "#FFFFFF",
  textColor: "#000000",

  setBgColor: (color: string) => set({ bgColor: color }),
  setForegroundColor: (color: string) => set({ foregroundColor: color }),
  setCardColor: (color: string) => set({ cardColor: color }),
  setCardForegroundColor: (color: string) =>
    set({ cardForegroundColor: color }),
  setTextColor: (color: string) => set({ textColor: color }),
  setPrimaryColor: (color: string) => set({ primaryColor: color }),
  setPrimaryForegroundColor: (color: string) =>
    set({ primaryForegroundColor: color }),
  setSecondaryColor: (color: string) => set({ secondaryColor: color }),
  setSecondaryForegroundColor: (color: string) =>
    set({ secondaryForegroundColor: color }),
  setAccentColor: (color: string) => set({ accentColor: color }),
  setAccentForegroundColor: (color: string) =>
    set({ accentForegroundColor: color }),
  setMutedColor: (color: string) => set({ mutedColor: color }),
  setMutedForegroundColor: (color: string) =>
    set({ mutedForegroundColor: color }),
  setInputColor: (color: string) => set({ inputColor: color }),
  setBorderColor: (color: string) => set({ borderColor: color }),
  setDestructiveColor: (color: string) => set({ destructiveColor: color }),
  setDestructiveForegroundColor: (color: string) =>
    set({ destructiveForegroundColor: color }),
  setRadius: (radius: 0 | 5 | 10 | 15 | 20 | 100) => set({ radius }),
}));
