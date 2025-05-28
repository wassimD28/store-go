"use client";
import { useDarkMode } from "@/client/store/darkMode.store";
import { useSidebar } from "@/client/store/sidebar.store";
import { SideBarData } from "@/lib/types/interfaces/common.interface";
import { cn, isSubNavActive } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  title: string;
  data: SideBarData[];
}
function SubNavBar({ title, data }: Props) {
  const { isSidebarOpen } = useSidebar();
  const { darkMode } = useDarkMode();
  const pathName = usePathname();

  return (
    <div
      className={cn(
        "ml-[60px] flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar p-4 transition-all duration-200 ease-in-out",
        isSidebarOpen && "ml-[200px]",
      )}
    >
      <h2 className="mb-6 font-geist text-xs uppercase">{title}</h2>
      <div className="flex w-full flex-col gap-2 overflow-hidden">
        {data.map((item, index) => (
          <Link
            className={cn(
              "flex h-10 w-full flex-row items-center gap-2 overflow-hidden rounded-2xl px-3 transition-all duration-200 ease-in-out hover:bg-foreground/10",
              isSubNavActive(item.route, pathName) &&
                "bg-primary-gradient text-white",
            )}
            href={item.route}
            key={index}
          >
            <item.icon
              className="dark:text-sidebar"
              width={24}
              height={24}
              color={
                darkMode
                  ? "white"
                  : isSubNavActive(item.route, pathName)
                    ? "white"
                    : "black"
              }
            />
            <h4 className="text-sm">{item.name}</h4>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SubNavBar;
