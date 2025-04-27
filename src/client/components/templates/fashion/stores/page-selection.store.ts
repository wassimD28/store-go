import { create } from "zustand";

export type PageType = "onboarding" | "login" | "home";

interface PageSelectionStore {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

export const usePageSelectionStore = create<PageSelectionStore>((set) => ({
  currentPage: "onboarding", // Default page
  setCurrentPage: (page) => set({ currentPage: page }),
}));