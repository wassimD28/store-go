import DriverIcon from "@/client/components/icons/sidebar/driverIcon";
import LinkIcon from "@/client/components/icons/sidebar/linkIcon";
import SettingIcon from "@/client/components/icons/sidebar/settingIcon";
import ExternalDriveIcon from "@/client/components/icons/sidebar/externalDriveIcon";
import ShoppingCartIcon from "@/client/components/icons/sidebar/shoppingCartIcon";
import TagIcon from "@/client/components/icons/sidebar/tagIcon";
import { SideBarData } from "../types/interfaces/common.interface";
import StarIcon from "@/client/components/icons/sidebar/starIcon";
import TemplateListIcon from "@/client/components/icons/sidebar/templateListIcon";
import CustomizeIcon from "@/client/components/icons/sidebar/customizeIcon";

export const dashboard: SideBarData[] = [
  {
    name: "All Stores",
    icon: ExternalDriveIcon,
    route: "/dashboard",
  },
  {
    name: "Create Store",
    icon: DriverIcon,
    route: "/dashboard/new",
  },
  {
    name: "Analytics",
    icon: StarIcon,
    route: "/dashboard/analytics",
  },
];

export const team: SideBarData[] = [
  {
    name: "Members",
    icon: ShoppingCartIcon,
    route: "/team/members",
  },
  {
    name: "Roles",
    icon: TagIcon,
    route: "/team/roles",
  },
  {
    name: "Invitations",
    icon: TagIcon,
    route: "/team/invitations",
  },
];


export const settings: SideBarData[] = [
  {
    name: "Account",
    icon: SettingIcon,
    route: "/settings/account",
  },
  {
    name: "Notifications",
    icon: SettingIcon,
    route: "/settings/notifications",
  },
  {
    name: "Security",
    icon: SettingIcon,
    route: "/settings/security",
  },
];

//----- storeId Sub sidebar ----
export const getProductSideBar = (storeId: string): SideBarData[] => [
  {
    name: "Product List",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/products/list`,
  },
  {
    name: "Categories",
    icon: ExternalDriveIcon,
    route: `/stores/${storeId}/products/categories`,
  },
  {
    name: "Attributes",
    icon: TagIcon,
    route: `/stores/${storeId}/products/attributes`,
  },
  {
    name: "Inventory",
    icon: TagIcon,
    route: `/stores/${storeId}/products/inventory`,
  },
];

export const getTemplatesSideBar = (storeId: string): SideBarData[] => [
  {
    name: "List",
    icon: TemplateListIcon,
    route: `/stores/${storeId}/templates/select`,
  },
  {
    name: "Customizations",
    icon: CustomizeIcon,
    route: `/stores/${storeId}/templates/customizations`,
  },
  {
    name: "Customizations",
    icon: LinkIcon,
    route: `/stores/${storeId}/templates/customization`,
  },
];

export const getPromotionsSideBar = (storeId: string): SideBarData[] => [
  {
    name: "Discounts",
    icon: TagIcon,
    route: `/stores/${storeId}/promotions/discounts`,
  },
  {
    name: "Coupons",
    icon: TagIcon,
    route: `/stores/${storeId}/promotions/coupons`,
  },
  {
    name: "Campaigns",
    icon: TagIcon,
    route: `/stores/${storeId}/promotions/campaigns`,
  },
];

export const getOrdersSideBar = (storeId: string): SideBarData[] => [
  {
    name: "All Orders",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/orders`,
  },
  {
    name: "Pending",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/orders/pending`,
  },
  {
    name: "Shipped",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/orders/shipped`,
  },
  {
    name: "Completed",
    icon: ShoppingCartIcon,
    route: `/stores/${storeId}/orders/completed`,
  },
];

export const getAppGenerationSideBar = (storeId: string): SideBarData[] => [
  {
    name: "Configuration",
    icon: SettingIcon,
    route: `/stores/${storeId}/app-generation/config`,
  },
  {
    name: "Preview",
    icon: SettingIcon,
    route: `/stores/${storeId}/app-generation/preview`,
  },
  {
    name: "Build",
    icon: SettingIcon,
    route: `/stores/${storeId}/app-generation/build`,
  },
  {
    name: "History",
    icon: SettingIcon,
    route: `/stores/${storeId}/app-generation/history`,
  },
  {
    name: "Downloads",
    icon: SettingIcon,
    route: `/stores/${storeId}/app-generation/downloads`,
  },
];

export const getStoreSettingsSideBar = (storeId: string): SideBarData[] => [
  {
    name: "General",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings/general`,
  },
  {
    name: "Payment",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings/payment`,
  },
  {
    name: "Shipping",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings/shipping`,
  },
  {
    name: "Taxes",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings/taxes`,
  },
  {
    name: "Users",
    icon: SettingIcon,
    route: `/stores/${storeId}/settings/users`,
  },
];

export const getAnalyticsSideBar = (storeId: string): SideBarData[] => [
  {
    name: "Overview",
    icon: StarIcon,
    route: `/stores/${storeId}/analytics/overview`,
  },
  {
    name: "Sales",
    icon: StarIcon,
    route: `/stores/${storeId}/analytics/sales`,
  },
  {
    name: "Customers",
    icon: StarIcon,
    route: `/stores/${storeId}/analytics/customers`,
  },
  {
    name: "Products",
    icon: StarIcon,
    route: `/stores/${storeId}/analytics/products`,
  },
];

export const getCustomersSideBar = (storeId: string): SideBarData[] => [
  {
    name: "Authenticated",
    icon: LinkIcon,
    route: `/stores/${storeId}/customers/list`,
  },
  {
    name: "Banned",
    icon: LinkIcon,
    route: `/stores/${storeId}/customers/banned`,
  },
];