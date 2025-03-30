import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MainSideBar from "@/client/components/sidebar/app-sidebar";
import { ReactNode } from "react";
import { storeSideBarData } from "@/lib/constants/mainSidebar";
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
    <div className="w-svw h-svh relative">
      <MainSideBar user={user} sideBarData={storeSideBarData} />
      {children}
    </div>
  );
}
