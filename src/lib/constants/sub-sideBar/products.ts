import CategoryIcon from "@/client/components/icons/sidebar/categoryIcon";
import ExternalDriveIcon from "@/client/components/icons/sidebar/externalDriveIcon";
import { SideBarData } from "@/lib/types/interfaces/common.interface";

export const productSideBarData: SideBarData[] = [
  {
    name: "Categories",
    icon: CategoryIcon,
    route: "/products/categories",
  },
  {
    name: "Product List",
    icon: ExternalDriveIcon,
    route: "/products/product-list",
  }
];
