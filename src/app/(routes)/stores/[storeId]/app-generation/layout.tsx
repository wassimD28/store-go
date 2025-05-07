import StoreHeader from "@/client/components/headers/globalHeader";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { getAppGenerationSideBar } from "@/lib/constants/subSidebar";
import { ReactNode } from "react";

async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden">
      {/* Header spanning full width */}
      <StoreHeader />

      {/* Sidebar in the first column */}
      <SubNavBar title="generations" data={getAppGenerationSideBar(storeId)} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-hidden">{children}</main>
    </div>
  );
}

export default Layout;
