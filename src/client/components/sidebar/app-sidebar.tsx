"use client";

import {
  Moon,
  Sun,
} from "lucide-react";

import { NavMain } from "@/client/components/sidebar/nav-main";
import { NavUser } from "@/client/components/sidebar/nav-user";
import { TeamSwitcher } from "@/client/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/client/components/ui/sidebar";
import { ComponentProps } from "react";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { Button } from "../ui/button";
import { NavUserData } from "@/lib/types/interfaces/common.interface";
import { data } from "@/lib/constants/sidebar.constant";
import HomeIcon from "../icons/navbar/HomeIcon";


export function AppSidebar({
  user,
  ...props
}: { user: NavUserData  } & ComponentProps<typeof Sidebar>) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isMobile } = useSidebar();


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <Button
            className=" border border-foreground/20"
            variant={"ghost"}
            onClick={() => toggleDarkMode()}
          >
            {darkMode ? <Sun /> : <Moon />}
          </Button>
          <HomeIcon className="size-20 text-primary" />
          
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isMobile={isMobile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
