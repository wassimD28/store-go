"use client"
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import { useDarkMode } from "@/client/store/useDarkMode.store";

function Page() {
    const {darkMode, toggleDarkMode} = useDarkMode()
    return (
      <div className="flex w-full flex-col p-4">
        <div className="flex gap-6 items-center">
          <Label htmlFor="darkMode">Dark Theme</Label>
          <Switch checked={darkMode} onClick={toggleDarkMode} id="darkMode" />
        </div>
      </div>
    );
}

export default Page;