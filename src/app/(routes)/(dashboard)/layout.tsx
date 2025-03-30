import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MainSideBar from "@/client/components/sidebar/app-sidebar";
import { ReactNode } from "react";
import { dashboardSideBarData } from "@/lib/constants/mainSidebar";
import HomeHeader from "@/client/components/headers/dashborad/home.header";
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = {
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "",
  };

  return (
    <div className="relative h-svh w-svw">
      <MainSideBar user={user} sideBarData={dashboardSideBarData} />
      <div className="flex h-full w-full flex-col">
        <HomeHeader />
        <div className="h-full w-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}
