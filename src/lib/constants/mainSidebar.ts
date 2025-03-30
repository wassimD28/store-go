"use client"
import HomeIcon from "@/client/components/icons/sidebar/homeIcon";
import DriverIcon from "@/client/components/icons/sidebar/driverIcon";
import LinkIcon from "@/client/components/icons/sidebar/linkIcon";
import SettingIcon from "@/client/components/icons/sidebar/settingIcon";
import ExternalDriveIcon from "@/client/components/icons/sidebar/externalDriveIcon";
import ShoppingCartIcon from "@/client/components/icons/sidebar/shoppingCartIcon";
import TagIcon from "@/client/components/icons/sidebar/tagIcon";
import { SideBarData } from "../types/interfaces/common.interface";
import StarIcon from "@/client/components/icons/sidebar/starIcon";


export const storeSideBarData: SideBarData[] = [
  {
    name: "Home",
    icon: HomeIcon,
    route: "/dashboard",
  },
  {
    name: "Products",
    icon: ExternalDriveIcon,
    route: "/products/categories",
  },
  {
    name: "Templates",
    icon: DriverIcon,
    route: "/templates",
  },
  {
    name: "Promotions",
    icon: TagIcon,
    route: "/tag",
  },
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
  },
];

export const dashboardSideBarData: SideBarData[] = [
  {
    name: "Projects",
    icon: ExternalDriveIcon,
    route: "/dashboard",
  },
  {
    name: "Accounts",
    icon: DriverIcon,
    route: "/dashboard/crost-selling",
  },
  {
    name: "Collections",
    icon: StarIcon,
    route: "/dashboard/new-collections",
  },
  {
    name: "Settings",
    icon: SettingIcon,
    route: "/dashboard/settings",
  },
]
