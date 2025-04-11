import { create } from "zustand";

interface LoginPageStore {
  inputPlaceholder: string;
  updateInputPlaceholder: (text: string) => void;
}

export const useLoginPageStore = create<LoginPageStore>((set) => ({
  inputPlaceholder: "type a name",
  updateInputPlaceholder: (text) => set({ inputPlaceholder: text }),
}));