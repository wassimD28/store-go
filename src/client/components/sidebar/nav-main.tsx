"use client";
import React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/client/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/client/components/ui/sidebar";
import { JSX } from "react";
// Create a custom type that can handle both Lucide icons and custom icons
type IconType =
  | LucideIcon
  | (({ className }: { className: string }) => JSX.Element);

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: IconType;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  // Helper function to render the icon correctly based on its type
  const renderIcon = (Icon: IconType | undefined) => {
    if (!Icon) return null;

    // Check if it's a Lucide icon (has the $$typeof property)
    const isLucideIcon = typeof Icon === "function" && "displayName" in Icon;

    if (isLucideIcon) {
      // For Lucide icons, just render normally
      return <Icon />;
    } else {
      // For custom icons, pass the required className prop
      return <Icon className="w-6 h-6" />;
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {renderIcon(item.icon)}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
