import { create } from "zustand";
import { SidebarStore } from "@/lib/types/interfaces/store.interface";

export const useSidebar = create<SidebarStore>()((set) => ({
  isSidebarOpen: false,
  toggleSidebarOpen: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen: boolean) => set({ isSidebarOpen }),
}));
