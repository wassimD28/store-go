import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MainSideBar from "@/client/components/sidebar/app-sidebar";
import { ReactNode } from "react";
import { dashboardSideBarData } from "@/lib/constants/mainSidebar";
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = {
    id: session?.user.id ?? "",
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "",
  };

  return (
    <div className="relative h-svh w-svw">
      <MainSideBar user={user} sideBarData={dashboardSideBarData} />
      {children}
    </div>
  );
}
