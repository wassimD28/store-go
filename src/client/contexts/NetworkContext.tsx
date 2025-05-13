"use client";

import { createContext, useContext, ReactNode } from "react";
import { useOnlineStatus } from "@/client/hooks/use-online-status";

interface NetworkContextType {
  isOnline: boolean;
  lastChanged: Date | null;
  checking: boolean;
  browserOnline: boolean;
  hasConnectivity: boolean;
  checkConnectivity: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const networkStatus = useOnlineStatus();

  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
