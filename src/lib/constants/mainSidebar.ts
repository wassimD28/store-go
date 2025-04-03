import HomeIcon from "@/client/components/icons/sidebar/homeIcon";
import DriverIcon from "@/client/components/icons/sidebar/driverIcon";
import LinkIcon from "@/client/components/icons/sidebar/linkIcon";
import SettingIcon from "@/client/components/icons/sidebar/settingIcon";
import ExternalDriveIcon from "@/client/components/icons/sidebar/externalDriveIcon";
import ShoppingCartIcon from "@/client/components/icons/sidebar/shoppingCartIcon";
import TagIcon from "@/client/components/icons/sidebar/tagIcon";
import { SideBarData } from "../types/interfaces/common.interface";
import StarIcon from "@/client/components/icons/sidebar/starIcon";

export const getStoreSideBarData = (storeId: string): SideBarData[] => [
  {
    name: "Home",
    icon: HomeIcon,
    route: `/stores/${storeId}`,
  },
  {
    name: "Products",
    icon: ExternalDriveIcon,
    route: `/stores/${storeId}/products/list`,
  },
  {
    name: "Templates",
    icon: DriverIcon,
    route: `/stores/${storeId}/templates`,
  },
  {
    name: "Promotions",
    icon: TagIcon,
    route: `/stores/${storeId}/promotions`,
  },
  {
    name: "Orders",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/orders`,
  },
  {
    name: "Generation",
    icon: LinkIcon,
    route: `/stores/${storeId}/app-generation`,
  },
  {
    name: "Analytics",
    icon: StarIcon,
    route: `/stores/${storeId}/analytics`,
  },
  {
    name: "Settings",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings`,
  },
];

export const dashboardSideBarData: SideBarData[] = [
  {
    name: "Stores",
    icon: ExternalDriveIcon,
    route: "/dashboard",
  },
  {
    name: "Team",
    icon: DriverIcon,
    route: "/team/members",
  },
  {
    name: "Templates",
    icon: StarIcon,
    route: "/dashboard/templates",
  },
  {
    name: "Billing",
    icon: SettingIcon,
    route: "/settings",
  },
  {
    name: "Settings",
    icon: SettingIcon,
    route: "/settings",
  },
];
