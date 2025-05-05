import StoreHeader from "@/client/components/headers/storeHeader";
import { ReactNode } from "react";
interface Props {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}
async function Layout({ children , params}: Props) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="grid h-screen w-screen grid-cols-[1fr] grid-rows-[auto_1fr]">
      {/* Header spanning full width */}

      <StoreHeader storeId={storeId} />

      {/* Main content in the second column */}
      <main className="h-full pl-[80px] w-full overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
