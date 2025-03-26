export interface DarkModeStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}
export interface SidebarStore {
  isSidebarOpen: boolean;
  toggleSidebarOpen: () => void;
  setSidebarOpen: (isSidebarOpen: boolean) => void;
}