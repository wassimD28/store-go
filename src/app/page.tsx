"use client";
import { Button } from "@/client/components/ui/button";
import { useDarkMode } from "@/client/store/darkMode.store";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";

function Page() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <div className="relative flex h-svh w-svw flex-col items-center justify-center bg-background text-foreground">
      <Button
        className="absolute right-5 top-5 border border-foreground/20 max-sm:relative max-sm:right-auto max-sm:top-auto max-sm:mb-5 max-sm:self-end"
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
