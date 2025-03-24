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
  }: {
    className: string;
    width: number;
    height: number;
  }) => JSX.Element;
  route: string;
}
export const sideBarData: SideBarData[] = [
  {
    name: "Home",
    icon: HomeIcon,
    route: "/dashboard",
  },
  {
    name: "ExternalDrive",
    icon: ExternalDriveIcon,
    route: "/links",
  },
  {
    name: "Drivers",
    icon: DriverIcon,
    route: "/drivers",
  },
  {
    name: "TagIcon",
    icon: TagIcon,
    route: "/tag",
  }
  ,
  {
    name: "Shopping",
    icon: ShoppingCartIcon,
    route: "/settings",
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
