"use client";

import { useNetwork } from "@/client/contexts/NetworkContext";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A banner that appears when the user is offline or shows a success state when connection is restored
 */
export function OfflineBanner() {
  const { isOnline, browserOnline, hasConnectivity, lastChanged } =
    useNetwork();
  const [show, setShow] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  // Handle connection state changes
  useEffect(() => {
    let showTimer: NodeJS.Timeout | null = null;
    let hideTimer: NodeJS.Timeout | null = null;

    if (!isOnline) {
      // Show offline banner after a small delay
      showTimer = setTimeout(() => setShow(true), 500);
      setShowReconnected(false);
    } else if (isOnline && lastChanged) {
      // Show reconnected banner
      setShowReconnected(true);
      setShow(true);

      // Hide the banner after a few seconds
      hideTimer = setTimeout(() => {
        // Start disappearing animation
        setShow(false);

        // Wait for animation to complete before removing from DOM
        setTimeout(() => {
          setShowReconnected(false);
        }, 500); // Match the duration in the CSS transition
      }, 3000);
    } else {
      // Normal online state
      setShow(false);

      // Wait for animation to complete before removing
      hideTimer = setTimeout(() => {
        setShowReconnected(false);
      }, 500);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOnline, lastChanged]);
  // Show different messages based on the network state
  const getMessage = () => {
    if (showReconnected) {
      return browserOnline && !hasConnectivity
        ? "Internet access restored"
        : "Connection restored";
    }

    if (!browserOnline) {
      return "You are currently offline. Some features may be unavailable.";
    } else if (browserOnline && !hasConnectivity) {
      return "Your device is connected to a network, but the internet is not accessible.";
    } else {
      return "You are currently offline. Some features may be unavailable.";
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 flex items-center justify-center gap-2 border p-2 text-center backdrop-blur-sm transition-all duration-500",
        "transform",
        show
          ? "bottom-0 translate-y-0 opacity-100"
          : "bottom-[-100px] translate-y-full opacity-0",
        showReconnected
          ? "bg-success/20 border-t-success-foreground/50 text-success-foreground"
          : "border-t-destructive-foreground/50 bg-destructive/10 text-destructive-foreground",
      )}
    >
      {browserOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span className="text-sm font-medium">{getMessage()}</span>
    </div>
  );
}
