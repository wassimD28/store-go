"use client";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "@/client/store/sidebar.store";
import { cn } from "@/lib/utils";
import { EnhancedBreadcrumb } from "../breadcrumb/enhanced.breadcrumb";


function GlobalHeader() {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="col-span-full flex w-full justify-between border-b bg-background px-4 py-3 shadow-xl shadow-black/5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-[60px] transition-all duration-200 ease-in-out",
            isSidebarOpen && "w-[200px]",
          )}
        ></span>
        <Button className="size-9 rounded-full bg-primary/10 hover:bg-primary/20">
          <ChevronLeft className="text-foreground" />
        </Button>
        <EnhancedBreadcrumb />
      </div>
      <div className="flex gap-4">
        
      </div>
    </div>
  );
}

export default GlobalHeader;
