import StoreHeader from "@/client/components/headers/storeHeader";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { getTemplatesSideBar } from "@/lib/constants/subSidebar";
import { ReactNode } from "react";
interface Props {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}
async function Layout({ children , params}: Props) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}

      <StoreHeader storeId={storeId} />

      {/* Sidebar in the first column */}
      <SubNavBar title="templates" data={getTemplatesSideBar(storeId)} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
