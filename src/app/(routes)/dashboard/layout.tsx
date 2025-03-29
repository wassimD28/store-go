"use client";
import PagesHeader from "@/client/components/headers/templates/pages.header";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { dashboardSideBarData } from "@/lib/constants/sub-sideBar/dashboard";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}
      <PagesHeader />

      {/* Sidebar in the first column */}
      <SubNavBar title="home" data={dashboardSideBarData} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-y-scroll">{children}</main>
    </div>
  );
}

export default Layout;
