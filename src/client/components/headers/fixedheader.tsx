"use client";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "@/client/store/sidebar.store";
import { cn, getFirstName } from "@/lib/utils";
import { CustomBreadcrumb } from "../breadcrumb/custom.breadcrumb";
import { useUserStore } from "@/client/store/user.store";
import { useHeaderStore } from "@/client/store/header.store";



function FixedHeader() {
  const { breadcrumbItems } = useHeaderStore()
  const { isSidebarOpen } = useSidebar();
  const { user } = useUserStore();
  const mainBreadcrumb = {
    name: `${getFirstName(user?.name ?? "user")}'s stores`,
    route: "/dashboard",
  };
  const homeBreadcrumb = [mainBreadcrumb, ...breadcrumbItems];
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
        <CustomBreadcrumb items={homeBreadcrumb} />
      </div>
      <div className="flex gap-4"></div>
    </div>
  );
}

export default FixedHeader;
