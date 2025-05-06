import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MainSideBar from "@/client/components/sidebar/app-sidebar";
import { ReactNode } from "react";
import { getStoreSideBarData } from "@/lib/constants/mainSidebar";
import { PusherProvider } from "@/client/providers/pusher.provider";
import { StoreProvider } from "@/client/providers/store.provider";
import { getStoreById } from "@/app/actions/store.actions";

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  // First, properly await the params object
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = {
    id: session?.user.id ?? "",
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "",
  };

  // Fetch the store data server-side to pass as initial data
  const storeResult = await getStoreById(storeId);
  const initialStore = storeResult.success ? storeResult.data : null;

  // Get sidebar data
  const sideBarData = getStoreSideBarData(storeId);

  return (
    <div className="relative h-svh w-svw">
      <PusherProvider storeId={storeId}>
        <StoreProvider storeId={storeId} initialStore={initialStore}>
          <MainSideBar user={user} sideBarData={sideBarData} />
          {children}
        </StoreProvider>
      </PusherProvider>
    </div>
  );
}
