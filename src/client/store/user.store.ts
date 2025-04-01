import { UserStore } from "@/lib/types/interfaces/store.interface"
import {create} from "zustand"

export const useUserStore = create<UserStore>(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  })
)
