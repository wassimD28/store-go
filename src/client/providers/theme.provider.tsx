"use client";
import { useEffect } from "react";
import { useDarkMode } from "@/client/store/useDarkMode.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode, setDarkMode } = useDarkMode();

  // Initial system preference check
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (!localStorage.getItem("theme-storage")) {
      setDarkMode(mediaQuery.matches);
    }

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setDarkMode]);

  // Theme application effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return children;
}
