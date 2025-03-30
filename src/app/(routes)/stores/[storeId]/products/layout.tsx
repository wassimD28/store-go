"use client";
import CategoryHeader from "@/client/components/headers/templates/category.header";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { productSideBarData } from "@/lib/constants/sub-sideBar/products";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}

      <CategoryHeader />

      {/* Sidebar in the first column */}
      <SubNavBar title="products" data={productSideBarData} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
