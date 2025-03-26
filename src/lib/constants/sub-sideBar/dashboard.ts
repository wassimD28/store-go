import AdvancedIcon from "@/client/components/icons/sidebar/advanced";
import CategoryIcon from "@/client/components/icons/sidebar/categoryIcon";
import DriverIcon from "@/client/components/icons/sidebar/driverIcon";
import StarIcon from "@/client/components/icons/sidebar/starIcon";
import { SideBarData } from "@/lib/types/interfaces/common.interface";

export const dashboardSideBarData: SideBarData[] = [
  {
    name: "Categories",
    icon: CategoryIcon,
    route: "/dashboard/categories",
  },
  {
    name: "Crost selling",
    icon: DriverIcon,
    route: "/dashboard/crost-selling",
  },
  {
    name: "New Collections",
    icon: StarIcon,
    route: "/dashboard/new-collections",
  },
  {
    name: "Advanced",
    icon: AdvancedIcon,
    route: "/dashboard/advanced",
  },
];