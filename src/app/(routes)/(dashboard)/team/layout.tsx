"use client";
import StoreHeader from "@/client/components/headers/globalHeader";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { team } from "@/lib/constants/subSidebar";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}
      <StoreHeader />

      {/* Sidebar in the first column */}
      <SubNavBar title="Team" data={team} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
