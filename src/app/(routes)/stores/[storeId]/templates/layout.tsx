import StoreHeader from "@/client/components/headers/storeHeader";
import SubNavBar from "@/client/components/sidebar/sub-sideBar";
import { templates } from "@/lib/constants/subSidebar";
import { ReactNode } from "react";
interface Props {
  children: ReactNode;
  params: Promise<{ storeId: string }> | { storeId: string };
}
async function Layout({ children , params}: Props) {
  const resolvedParams = await Promise.resolve(params);
  const storeId = resolvedParams.storeId;
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}

      <StoreHeader storeId={storeId} />

      {/* Sidebar in the first column */}
      <SubNavBar title="templates" data={templates} />

      {/* Main content in the second column */}
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
