"use client";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import { useDarkMode } from "@/client/store/darkMode.store";
import { useSidebar } from "@/client/store/sidebar.store";

function Page() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isOverLayout , setOverLayout} = useSidebar();
  return (
    <div className="flex w-full flex-col p-4">
      <div className="flex items-center gap-6">
        <Label htmlFor="darkMode">Dark Theme</Label>
        <Switch checked={darkMode} onClick={toggleDarkMode} id="darkMode" />
      </div>
      <hr />
      <div className="flex items-center gap-6">
        <Label htmlFor="isOverLayout">Fix Side Bar over layout</Label>
        <Switch checked={isOverLayout} onClick={()=>setOverLayout(!isOverLayout)} id="isOverLayout" />
      </div>
    </div>
  );
}

export default Page;
