import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MainSideBar from "@/client/components/sidebar/app-sidebar";
import { ReactNode } from "react";
import { getStoreSideBarData } from "@/lib/constants/mainSidebar";

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }> | { storeId: string };
}) {
  // First, properly await the params object
  const resolvedParams = await Promise.resolve(params);
  const storeId = resolvedParams.storeId;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = {
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "",
  };

  // Now use the correctly resolved storeId
  const sideBarData = getStoreSideBarData(storeId);

  return (
    <div className="relative h-svh w-svw">
      <MainSideBar user={user} sideBarData={sideBarData} />
      {children}
    </div>
  );
}
