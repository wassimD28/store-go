import { UserStore } from "@/lib/types/interfaces/store.interface"
import {create} from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create<UserStore>()(
  persist((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  }),{
    name: "user-store",
  })
)
