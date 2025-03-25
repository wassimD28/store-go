import HomeIcon from "@/client/components/icons/navbar/HomeIcon";
import DriverIcon from "@/client/components/icons/navbar/DriverIcon";
import LinkIcon from "@/client/components/icons/navbar/LinkIcon";
import SettingIcon from "@/client/components/icons/navbar/SettingIcon";
import ExternalDriveIcon from "@/client/components/icons/navbar/ExternalDriveIcon";
import ShoppingCartIcon from "@/client/components/icons/navbar/ShoppingCartIcon";
import TagIcon from "@/client/components/icons/navbar/TagIcon";
import { JSX } from "react";

interface SideBarData {
  name: string;
  icon: ({
    className,
    width,
    height,
    color,
    darkColor,
  }: {
    className: string;
    width: number;
    height: number;
    color: string;
    darkColor?: string;
  }) => JSX.Element;
  route: string;
}
export const sideBarData: SideBarData[] = [
  {
    name: "Dashboard",
    icon: HomeIcon,
    route: "/dashboard",
  },
  {
    name: "Products",
    icon: ExternalDriveIcon,
    route: "/links",
  },
  {
    name: "Templates",
    icon: DriverIcon,
    route: "/drivers",
  },
  {
    name: "Promotions",
    icon: TagIcon,
    route: "/tag",
  }
  ,
  {
    name: "Orders",
    icon: ShoppingCartIcon,
    route: "/orders",
  },
  {
    name: "Link",
    icon: LinkIcon,
    route: "/links",
  },
  {
    name: "Setting",
    icon: SettingIcon,
    route: "/settings",
  }
];
