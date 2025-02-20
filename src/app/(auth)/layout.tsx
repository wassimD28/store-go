"use client"
import { Button } from "@/client/components/ui/button";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { Sun, Moon } from "lucide-react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <div className="w-svw h-svh">
      <Button
        className="fixed border border-foreground/20 right-5 top-5 max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:self-end max-sm:mb-5 z-50"
        variant={"ghost"}
        onClick={() => toggleDarkMode()}
      >
        {darkMode ? <Sun /> : <Moon />}
      </Button>
      {children}
    </div>
  );
}
