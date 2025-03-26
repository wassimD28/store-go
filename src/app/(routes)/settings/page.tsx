"use client";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import { useDarkMode } from "@/client/store/darkMode.store";

function Page() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <div className="flex w-full flex-col p-4">
      <div className="flex items-center gap-6">
        <Label htmlFor="darkMode">Dark Theme</Label>
        <Switch checked={darkMode} onClick={toggleDarkMode} id="darkMode" />
      </div>
    </div>
  );
}

export default Page;
