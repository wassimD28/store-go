"use client";
import StoreHeader from "@/client/components/headers/store/store.header";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header spanning full width */}
      <StoreHeader/>

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
