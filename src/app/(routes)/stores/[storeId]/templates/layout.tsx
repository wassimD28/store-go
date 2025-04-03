"use client";
import PagesHeader from "@/client/components/headers/templates/pages.header";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { templateSideBarData } from "@/lib/constants/sub-sideBar/generations";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}

      <PagesHeader />

      {/* Sidebar in the first column */}
      <SubNavBar title="templates" data={templateSideBarData} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
