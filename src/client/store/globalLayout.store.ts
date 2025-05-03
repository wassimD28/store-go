import { create } from "zustand";

interface GlobalLayoutStore {
  radius: 0 | 5 | 10 | 15 | 100;
  // Theme mode
  isDarkMode: boolean;
  // Background colors
  backgroundColor: string;
  foregroundColor: string;
  // Card colors
  cardColor: string;
  cardForegroundColor: string;
  // Primary colors
  primaryColor: string;
  primaryForegroundColor: string;
  // Muted colors
  mutedColor: string;
  mutedForegroundColor: string;
  // Input and border colors
  inputColor: string;
  inputForegroundColor: string;
  borderColor: string;

  // Dark theme colors
  darkBackgroundColor: string;
  darkForegroundColor: string;
  darkCardColor: string;
  darkCardForegroundColor: string;
  darkPrimaryColor: string;
  darkPrimaryForegroundColor: string;
  darkMutedColor: string;
  darkMutedForegroundColor: string;
  darkInputColor: string;
  darkInputForegroundColor: string;
  darkBorderColor: string;

  // Setters
  toggleDarkMode: () => void;
  setBgColor: (color: string, isDark?: boolean) => void;
  setForegroundColor: (color: string, isDark?: boolean) => void;
  setCardColor: (color: string, isDark?: boolean) => void;
  setCardForegroundColor: (color: string, isDark?: boolean) => void;
  setPrimaryColor: (color: string, isDark?: boolean) => void;
  setPrimaryForegroundColor: (color: string, isDark?: boolean) => void;
  setMutedColor: (color: string, isDark?: boolean) => void;
  setMutedForegroundColor: (color: string, isDark?: boolean) => void;
  setInputColor: (color: string, isDark?: boolean) => void;
  setInputForegroundColor: (color: string, isDark?: boolean) => void;
  setBorderColor: (color: string, isDark?: boolean) => void;
  setRadius: (radius: 0 | 5 | 10 | 15 | 100) => void;
  resetToDefaults: () => void;
  // Get active theme colors
  getActiveColors: () => {
    backgroundColor: string;
    foregroundColor: string;
    cardColor: string;
    cardForegroundColor: string;
    primaryColor: string;
    primaryForegroundColor: string;
    mutedColor: string;
    mutedForegroundColor: string;
    inputColor: string;
    inputForegroundColor: string;
    borderColor: string;
  };
}

// Default values for light theme colors
const lightThemeDefaults = {
  backgroundColor: "#FFFFFF",
  foregroundColor: "#000000",
  primaryColor: "#000000",
  primaryForegroundColor: "#FFFFFF",
  mutedColor: "#efefef",
  mutedForegroundColor: "#8e8e8e",
  cardColor: "#FFFFFF",
  cardForegroundColor: "#000000",
  borderColor: "#E5E5E5",
  inputColor: "#F4F4F4",
  inputForegroundColor: "#b6b6b6",
};

// Default values for dark theme colors
const darkThemeDefaults = {
  darkBackgroundColor: "#1E1E1E",
  darkForegroundColor: "#FFFFFF",
  darkPrimaryColor: "#ffffff",
  darkPrimaryForegroundColor: "#000000",
  darkMutedColor: "#2D2D2D",
  darkMutedForegroundColor: "#A0A0A0",
  darkCardColor: "#252525",
  darkCardForegroundColor: "#FFFFFF",
  darkBorderColor: "#333333",
  darkInputColor: "#2A2A2A",
  darkInputForegroundColor: "#969696",
};

// Default values for all properties
const defaultValues = {
  radius: 100 as 0 | 5 | 10 | 15 | 100,
  isDarkMode: false,
  ...lightThemeDefaults,
  ...darkThemeDefaults,
};

export const useGlobalLayout = create<GlobalLayoutStore>((set, get) => ({
  ...defaultValues,

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  setBgColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkBackgroundColor" : "backgroundColor"]: color }),

  setForegroundColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkForegroundColor" : "foregroundColor"]: color }),

  setCardColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkCardColor" : "cardColor"]: color }),

  setCardForegroundColor: (color: string, isDark = false) =>
    set({
      [isDark ? "darkCardForegroundColor" : "cardForegroundColor"]: color,
    }),

  setPrimaryColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkPrimaryColor" : "primaryColor"]: color }),

  setPrimaryForegroundColor: (color: string, isDark = false) =>
    set({
      [isDark ? "darkPrimaryForegroundColor" : "primaryForegroundColor"]: color,
    }),

  setMutedColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkMutedColor" : "mutedColor"]: color }),

  setMutedForegroundColor: (color: string, isDark = false) =>
    set({
      [isDark ? "darkMutedForegroundColor" : "mutedForegroundColor"]: color,
    }),

  setInputColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkInputColor" : "inputColor"]: color }),

  setInputForegroundColor: (color: string, isDark = false) =>
    set({
      [isDark ? "darkInputForegroundColor" : "inputForegroundColor"]: color,
    }),

  setBorderColor: (color: string, isDark = false) =>
    set({ [isDark ? "darkBorderColor" : "borderColor"]: color }),

  setRadius: (radius: 0 | 5 | 10 | 15 | 100) => set({ radius }),

  resetToDefaults: () => set({ ...defaultValues }),

  getActiveColors: () => {
    const state = get();
    if (state.isDarkMode) {
      return {
        backgroundColor: state.darkBackgroundColor,
        foregroundColor: state.darkForegroundColor,
        cardColor: state.darkCardColor,
        cardForegroundColor: state.darkCardForegroundColor,
        primaryColor: state.darkPrimaryColor,
        primaryForegroundColor: state.darkPrimaryForegroundColor,
        mutedColor: state.darkMutedColor,
        mutedForegroundColor: state.darkMutedForegroundColor,
        inputColor: state.darkInputColor,
        inputForegroundColor: state.darkInputForegroundColor,
        borderColor: state.darkBorderColor,
      };
    } else {
      return {
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
        cardColor: state.cardColor,
        cardForegroundColor: state.cardForegroundColor,
        primaryColor: state.primaryColor,
        primaryForegroundColor: state.primaryForegroundColor,
        mutedColor: state.mutedColor,
        mutedForegroundColor: state.mutedForegroundColor,
        inputColor: state.inputColor,
        inputForegroundColor: state.inputForegroundColor,
        borderColor: state.borderColor,
      };
    }
  },
}));
