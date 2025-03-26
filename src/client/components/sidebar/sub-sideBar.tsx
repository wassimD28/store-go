"use client";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { SideBarData } from "@/lib/types/interfaces/common.interface";
import { cn, isActiveRoute } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props{
  title : string;
  data : SideBarData[]
}
function SubNavBar({title, data}: Props) {
  const { darkMode } = useDarkMode();
  const pathName = usePathname();

  return (
    <div className="ml-[60px] flex h-full w-56 flex-col border-r-2 border-sidebar-border bg-sidebar p-4">
      <h2 className="mb-6 font-geist text-xs uppercase">{title}</h2>
      <div className="flex w-full flex-col gap-2">
        {data.map((item, index) => (
          <Link
            className={cn(
              "flex h-10 w-full flex-row items-center gap-2 overflow-hidden rounded-2xl px-3 transition-all duration-200 ease-in-out hover:bg-foreground/10",
              isActiveRoute(item.route, pathName) &&
                "bg-primary text-white hover:bg-primary dark:font-medium dark:text-sidebar",
            )}
            href={item.route}
            key={index}
          >
            <item.icon
              className="dark:text-sidebar"
              width={24}
              height={24}
              color={
                isActiveRoute(item.route, pathName)
                  ? darkMode
                    ? "black" // Black when dark mode is on and route is active
                    : "white" // White when dark mode is off and route is active
                  : darkMode
                    ? "white" // Black in dark mode when route is inactive
                    : "black" // Black in light mode when route is inactive
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
