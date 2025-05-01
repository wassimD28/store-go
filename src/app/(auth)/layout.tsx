"use client";
import { Button } from "@/client/components/ui/button";
import { useDarkMode } from "@/client/store/darkMode.store";
import { Sun, Moon } from "lucide-react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  console.log("NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL!);
  return (
    <div className="h-svh w-svw">
      <Button
        className="fixed right-5 top-5 z-50 border border-foreground/20 max-sm:relative max-sm:right-auto max-sm:top-auto max-sm:mb-5 max-sm:self-end"
        variant={"ghost"}
        onClick={() => toggleDarkMode()}
      >
        {darkMode ? <Sun /> : <Moon />}
      </Button>
      {children}
    </div>
  );
}
