"use client";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  Moon,
  PieChart,
  Settings2,
  SquareTerminal,
  Sun,
} from "lucide-react";

import { NavMain } from "@/client/components/sidebar/nav-main";
import { NavProjects } from "@/client/components/sidebar/nav-projects";
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
import { authClient } from "@/lib/auth-client";
import { ComponentProps } from "react";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { Button } from "../ui/button";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },

        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: { user: any } & ComponentProps<typeof Sidebar>) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isMobile } = useSidebar();


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <Button
            className=" border border-foreground/20"
            variant={"ghost"}
            onClick={() => toggleDarkMode()}
          >
            {darkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isMobile={isMobile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
