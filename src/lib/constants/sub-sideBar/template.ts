import AdvancedIcon from "@/client/components/icons/sidebar/advanced";
import CategoryIcon from "@/client/components/icons/sidebar/categoryIcon";
import DriverIcon from "@/client/components/icons/sidebar/driverIcon";
import MessageNotifIcon from "@/client/components/icons/sidebar/messageNotifIcon";
import { SideBarData } from "@/lib/types/interfaces/common.interface";

export const templateSideBarData : SideBarData[]=[
  {
    name: "Theme & menu",
    icon: CategoryIcon,
    route: "/templates/theme",
  },
  {
    name: "Pages",
    icon: DriverIcon,
    route: "/templates/pages",
  },
  {
    name: "Contact info",
    icon: MessageNotifIcon,
    route: "/templates/contact",
  },
  {
    name: "Advanced",
    icon: AdvancedIcon,
    route: "/templates/advanced",
  },

]