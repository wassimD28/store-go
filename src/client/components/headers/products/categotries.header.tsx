"use client";
import { ChevronLeft, Eye } from "lucide-react";
import { Button } from "../../ui/button";
import { PagesBreadCrumb } from "../../breadcrumb/pages.breadcrumb";
import { PublishedFilter } from "../../filter/published.filter";
import { useSidebar } from "@/client/store/sidebar.store";
import { cn } from "@/lib/utils";

function PagesHeader() {
  const { isSidebarOpen } = useSidebar();
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
        <PagesBreadCrumb />
      </div>
      <div className="flex gap-4">
        <PublishedFilter />
        <Button size={"lg"}>Save</Button>
        <Button size={"lg"} className="bg-sidebar" variant={"outline"}>
          <span className="flex size-6 items-center justify-center rounded-full bg-foreground/10">
            <Eye />
          </span>
          Preview
        </Button>
      </div>
    </div>
  );
}

export default PagesHeader;
