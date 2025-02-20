import { AppSidebar } from "@/client/components/app-sidebar";
import { SidebarProvider } from "@/client/components/ui/sidebar";
import { ReactNode } from "react";

export default function RootLayout({
  children,
}:{
  children: ReactNode;
}) {
  return (
    <div className="w-svw h-svh">
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </div>
  );
}
