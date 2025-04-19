import StoreHeader from "@/client/components/headers/storeHeader";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { getProductSideBar } from "@/lib/constants/subSidebar";
import { ReactNode } from "react";

async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }> | { storeId: string };
}) {
  // First, properly await params before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const storeId = resolvedParams.storeId;

  // Then use the resolved storeId
  const sideBarData = getProductSideBar(storeId);

  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}
      <StoreHeader storeId={storeId} />

      {/* Sidebar in the first column */}
      <SubNavBar title="products" data={sideBarData} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
