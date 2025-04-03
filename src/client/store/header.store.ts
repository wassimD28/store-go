import { create } from "zustand"

interface HeaderStore {
  breadcrumbItems : {
    name: string;
    route: string;
  }[];
  setBreadcrumbItems: (items: HeaderStore["breadcrumbItems"]) => void;
  clearBreadcrumbItems: () => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  breadcrumbItems: [],
  setBreadcrumbItems: (items) => set({ breadcrumbItems: items }),
  clearBreadcrumbItems: () => set({ breadcrumbItems: [] }),
}))