import StoreHeader from "@/client/components/headers/storeHeader";
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


  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header spanning full width */}
      <div className="fixed w-full z-40">
        <StoreHeader storeId={storeId} />
      </div>

      {/* Main content in the second column */}
      <main className="w-full">{children}</main>
    </div>
  );
}

export default Layout;
