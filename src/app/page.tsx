"use client"
import { Button } from "@/client/components/ui/button";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";

function Page() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <div className="flex flex-col items-center justify-center bg-background text-foreground relative w-svw h-svh">
      <Button
        className="absolute border border-foreground/20 right-5 top-5 max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:self-end max-sm:mb-5"
        variant={"ghost"}
        onClick={() => toggleDarkMode()}
      >
        {darkMode ? <Sun /> : <Moon />}
      </Button>
      <div className="flex gap-4">
        <Button>
          <Link href={"/sign-up"}>Sign Up</Link>
        </Button>
        <Button>
          <Link href={"/sign-in"}>Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

export default Page;
