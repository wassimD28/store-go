import { NavUserData } from "./common.interface";

export interface DarkModeStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}
export interface SidebarStore {
  isSidebarOpen: boolean;
  isOverLayout: boolean;
  toggleSidebarOpen: () => void;
  setOverLayout: (isOverLayout: boolean) => void;
  setSidebarOpen: (isSidebarOpen: boolean) => void;
}
export interface UserStore{
  user: NavUserData | null;
  setUser: (user: NavUserData) => void;
  logout: () => void;
}