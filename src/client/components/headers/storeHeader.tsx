"use client";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "@/client/store/sidebar.store";
import { cn } from "@/lib/utils";
import { EnhancedBreadcrumb } from "../breadcrumb/enhanced.breadcrumb";
import { NotificationBell } from "../real-time/notificationBell";

interface Props {
  storeId: string;
}
function StoreHeader({ storeId }: Props) {
  const { isSidebarOpen } = useSidebar();

  if (!storeId) {
    throw "No store ID provided to 'StoreHeader'";
  }

  return (
    <div className="col-span-full flex w-full justify-between border-b bg-sidebar px-4 py-3 shadow-xl shadow-black/5">
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
        <NotificationBell storeId={storeId} />
      </div>
    </div>
  );
}

export default StoreHeader;
