import GlobalHeader from "@/client/components/headers/globalHeader";
import { ReactNode } from "react";

async function Layout({
  children,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  // First, properly await params before accessing properties


  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header spanning full width */}
      <div className="fixed z-40 w-full">
        <GlobalHeader />
      </div>

      {/* Main content in the second column */}
      <main className="w-full pt-10 pl-10">{children}</main>
    </div>
  );
}

export default Layout;
