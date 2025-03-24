import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { ReactNode } from "react";

function Layout({children}: {children: ReactNode}) {
    return (
      <div className="relative h-svh w-svw">
        <div className="h-12 w-full bg-sidebar border-b-2 border-sidebar-border"></div>
        <SubNavBar/>
        {children}
      </div>
    );
}

export default Layout;