"use client";
import { useState } from "react";
import Link from "next/link";
import { FadeText } from "../ui/fade-text";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  NavUserData,
  SideBarData,
} from "@/lib/types/interfaces/common.interface";
import { NavUser } from "./nav-user";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/client/store/darkMode.store";
import { useSidebar } from "@/client/store/sidebar.store";
import TextLogoIcon from "../icons/textLogoIcon";
import LogoIcon from "../icons/logoIcon";

const EXPENDED_WIDTH = 200;
const COLLAPSED_WIDTH = 60;
const ICON_WIDTH = 24;
interface props {
  sideBarData: SideBarData[];
  user: NavUserData;
}
function MainSideBar({ user, sideBarData }: props) {
  const { darkMode } = useDarkMode();
  const { setSidebarOpen } = useSidebar();
  const [isExpend, setIsExpend] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const handleOnMouseOver = () => {
    setIsExpend(true);
    setSidebarOpen(true);
  };
  const handleOnMouseLeave = () => {
    setIsExpend(false);
    setSidebarOpen(false);
  };

  const isMainActive = (route: string) => {
    const routeSegments = route.split("/").filter(Boolean);
    // For dashboard, check first segment
    if (routeSegments[0] === "dashboard") {
      return (
        segments[0] === "dashboard" &&
        (routeSegments.length === 1 || routeSegments[1] === segments[1])
      );
    }
    // For stores, match only the main "stores" sections
    if (routeSegments[0] === "stores") {
      return segments[0] === "stores" && segments[2] === routeSegments[2];
    }
    return false;
  };
  return (
    <div
      className="fixed z-50 flex h-full flex-col items-center justify-between overflow-hidden border-r border-sidebar-border bg-sidebar py-6 transition-all duration-200 ease-in-out"
      style={{
        width: isExpend ? EXPENDED_WIDTH : COLLAPSED_WIDTH,
      }}
      onMouseOver={handleOnMouseOver}
      onMouseLeave={handleOnMouseLeave}
    >
      <div className="flex flex-col gap-2">
        {/* logo  */}{" "}
        <Link href={"/dashboard"}>
          <div className="relative h-14">
            <LogoIcon
              className={cn(
                "absolute transition-all duration-200 ease-in-out",
                isExpend && "ml-6 scale-75 opacity-0",
              )}
              width={40}
              height={40}
              color={darkMode ? "#793DF4" : "#793DF4"}
              iconColor={"white"}
            />
            <TextLogoIcon
              className={cn(
                "absolute scale-75 opacity-0 transition-all duration-200 ease-in-out",
                isExpend && "ml-3 scale-100 opacity-100",
              )}
              color={darkMode ? "#793DF4" : "#793DF4"}
              iconColor={"white"}
              width={150}
              height={40}
            />
          </div>
        </Link>
        {/* sidebar content */}
        {sideBarData.map((item, index) => (
          <Link
            href={item.route}
            key={index}
            style={{ width: isExpend ? EXPENDED_WIDTH - 8 : ICON_WIDTH + 16 }}
            className={cn(
              `relative flex h-10 flex-row items-center justify-center gap-2 overflow-hidden rounded-2xl transition-all duration-200 ease-in-out hover:bg-foreground/10`,
              !isExpend && `p-0`,
              isMainActive(item.route) && "bg-primary-gradient text-white",
            )}
          >
            <item.icon
              className={cn(
                "translate-x-2 transition-all duration-200 ease-in-out",
                isExpend && "translate-x-5",
              )}
              width={ICON_WIDTH}
              height={ICON_WIDTH}
              color={
                isMainActive(item.route)
                  ? "white"
                  : darkMode
                    ? "white"
                    : "black"
              }
            />
            <div className="relative flex flex-1 items-center justify-start">
              <FadeText
                className={`absolute -left-8 -translate-y-2.5 pl-14 font-poppins text-sm font-normal`}
                direction="left"
                text={item.name}
                isVisible={isExpend}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* nav user */}
      <NavUser user={user} isExpend={isExpend} />
    </div>
  );
}

export default MainSideBar;
