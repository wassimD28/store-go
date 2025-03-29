"use client";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { PublishedFilter } from "../../filter/published.filter";
import { useSidebar } from "@/client/store/sidebar.store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CustomBreadcrumb } from "../../breadcrumb/custom.breadcrumb";

const breadCrumbItems = [
    { name : "store", route: "store"}
]
function StoreHeader() {
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
        <CustomBreadcrumb items={breadCrumbItems} />
      </div>
      <div className="flex gap-4">
        <PublishedFilter />
        <Link href={"/products/categories/new"}>
          <Button size={"lg"}>
            Create <Plus />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default StoreHeader;
