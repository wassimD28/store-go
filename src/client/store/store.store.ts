import { create } from "zustand"

interface StoreZustandInstance {
  store: {
    id: string;
    name: string;
    logoUrl: string | null;
    category: {
      id: string;
      name: string | null;
    };
  }| null;
  setStore: (store: StoreZustandInstance["store"] | null) => void;
  clearStore: () => void;
}

export const useStoreStore = create<StoreZustandInstance>((set) => ({
  store: null,
  setStore: (store) => set({ store }),
  clearStore: () => set({ store: null }),
}))