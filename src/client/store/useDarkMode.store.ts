import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DarkModeStore } from "@/lib/types/interfaces/store.interface";

export const useDarkMode = create<DarkModeStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (darkMode: boolean) => set({ darkMode }),
    }),
    {
      name: "theme-storage",
    }
  )
);
