import { Moon, Sun } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { useGlobalLayout } from "@/client/store/globalLayout.store";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useGlobalLayout();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      className="ml-auto h-8 w-8"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
