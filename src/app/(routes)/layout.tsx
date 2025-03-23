import { AppSidebar } from "@/client/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/client/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReactNode } from "react";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
  const user = {
        name: session?.user.name ?? "",
        email: session?.user.email ?? "",
        avatar: session?.user.image ?? "",
      }
    
  return (
    <div className="w-svw h-svh">
      <SidebarProvider>
        <AppSidebar user={user} />
        {children}
      </SidebarProvider>
    </div>
  );
}
