import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}
      <header className="col-span-full h-12 border-b-2 border-sidebar-border bg-sidebar"></header>

      {/* Sidebar in the first column */}
      <SubNavBar />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
