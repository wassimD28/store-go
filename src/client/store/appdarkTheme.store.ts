import { create } from "zustand";

interface DarkThemeStore {
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
}

export const useDarkTheme = create<DarkThemeStore>((set) => ({
  bgColor: "#0A0A0A",
  foregroundColor: "#FAFAFA",
  primaryColor: "#7C3AED", // Vibrant purple
  primaryForegroundColor: "#FFFFFF",
  secondaryColor: "#262626",
  secondaryForegroundColor: "#E5E5E5",
  accentColor: "#6D28D9", // Darker purple
  accentForegroundColor: "#FFFFFF",
  mutedColor: "#525252",
  mutedForegroundColor: "#A3A3A3",
  cardColor: "#171717",
  cardForegroundColor: "#FFFFFF",
  borderColor: "#404040",
  inputColor: "#262626",
  destructiveColor: "#DC2626",
  destructiveForegroundColor: "#FFFFFF",
  textColor: "#FAFAFA",

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
}));
