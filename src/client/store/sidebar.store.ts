import { create } from "zustand";
import { SidebarStore } from "@/lib/types/interfaces/store.interface";
import { persist } from "zustand/middleware";

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isOverLayout: false, // This will be changed by the settings toggle
      toggleSidebarOpen: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setOverLayout: (isOverLayout: boolean) => set({ isOverLayout }),
      setSidebarOpen: (isSidebarOpen: boolean) => set({ isSidebarOpen }),
    }),
    {
      name: "sidebar-settings",
      partialize: (state) => ({ isOverLayout: state.isOverLayout }), // Only persist the necessary state
    },
  ),
);