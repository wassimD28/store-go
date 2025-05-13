"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// Configuration for connectivity checks
const CONNECTIVITY_CHECK_CONFIG = {
  pingUrl: "https://www.google.com/favicon.ico",
  connectedCheckInterval: 5000,
  offlineCheckInterval: 2000,
  pingTimeout: 5000,
  failureThreshold: 2,
  successThreshold: 1,
};

interface NetworkStatusState {
  browserOnline: boolean;
  hasConnectivity: boolean;
  lastChanged: Date | null;
  checking: boolean;
  lastError: string | null;
  failureCount: number;
  successCount: number;
}

export function useOnlineStatus() {
  // State for tracking network status
  const [state, setState] = useState<NetworkStatusState>({
    browserOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    hasConnectivity: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastChanged: null,
    checking: false,
    lastError: null,
    failureCount: 0,
    successCount: 0,
  });

  // Reference to interval timers
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reference to store updateConnectivityStatus function to avoid circular dependencies
  const updateConnectivityStatusRef = useRef<(() => Promise<void>) | undefined>(
    undefined,
  );

  // Get derived isOnline state
  const isOnline = state.browserOnline && state.hasConnectivity;

  // Function to check actual connectivity by pinging a reliable endpoint
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || typeof fetch === "undefined") {
      return true; // Default to true if running on server
    }

    try {
      setState((prev) => ({ ...prev, checking: true }));

      // Create an AbortController to timeout the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONNECTIVITY_CHECK_CONFIG.pingTimeout,
      );

      // Use the current timestamp to bust cache
      const url = `${CONNECTIVITY_CHECK_CONFIG.pingUrl}?_=${Date.now()}`;

      // Try to fetch a small resource
      await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setState((prev) => ({ ...prev, checking: false, lastError: null }));

      // If we got here, we have connectivity
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        checking: false,
        lastError: errorMessage,
      }));
      console.warn(`StoreGo Connectivity check failed: ${errorMessage}`);

      // If the error is not an abort error (timeout), and navigator says we're online
      // then we're connected to Wi-Fi but don't have actual internet access
      if (
        typeof navigator !== "undefined" &&
        navigator.onLine &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        console.warn("StoreGo Connected to network but no internet access");
      }

      return false;
    }
  }, []);

  // Function to schedule the next connectivity check
  const scheduleNextCheck = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    // Schedule next check based on current connectivity state
    const interval = state.hasConnectivity
      ? CONNECTIVITY_CHECK_CONFIG.connectedCheckInterval
      : CONNECTIVITY_CHECK_CONFIG.offlineCheckInterval;

    intervalRef.current = setTimeout(() => {
      // Use the ref to call updateConnectivityStatus
      if (updateConnectivityStatusRef.current) {
        updateConnectivityStatusRef.current();
      }
    }, interval);
  }, [state.hasConnectivity]);

  // Function to update connectivity status based on ping results
  const updateConnectivityStatus = useCallback(async (): Promise<void> => {
    const hasConnection = await checkConnectivity();

    setState((prev) => {
      // Calculate new failure and success counts
      const failureCount = hasConnection ? 0 : prev.failureCount + 1;
      const successCount = hasConnection ? prev.successCount + 1 : 0;

      // Determine if connectivity status should change
      let newHasConnectivity = prev.hasConnectivity;
      if (
        !prev.hasConnectivity &&
        successCount >= CONNECTIVITY_CHECK_CONFIG.successThreshold
      ) {
        newHasConnectivity = true;
      } else if (
        prev.hasConnectivity &&
        failureCount >= CONNECTIVITY_CHECK_CONFIG.failureThreshold
      ) {
        newHasConnectivity = false;
      }

      // Only update lastChanged if connectivity status changed
      const lastChanged =
        newHasConnectivity !== prev.hasConnectivity
          ? new Date()
          : prev.lastChanged;

      // Log status changes
      if (newHasConnectivity !== prev.hasConnectivity) {
        console.log(
          `StoreGo ${newHasConnectivity ? "Online" : "Offline"}: Internet connectivity ${newHasConnectivity ? "restored" : "lost"}`,
        );
      }

      // Store status in sessionStorage for non-React utilities to access
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(
            "network-connectivity-status",
            JSON.stringify({
              browserOnline: prev.browserOnline,
              hasConnectivity: newHasConnectivity,
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (_) {
        // Ignore sessionStorage errors (e.g., in private browsing mode)
      }

      return {
        ...prev,
        hasConnectivity: newHasConnectivity,
        failureCount,
        successCount,
        lastChanged:
          newHasConnectivity !== prev.hasConnectivity
            ? lastChanged
            : prev.lastChanged,
      };
    });

    // Schedule next check
    scheduleNextCheck();
  }, [checkConnectivity, scheduleNextCheck]);

  // Store the function in the ref so scheduleNextCheck can use it
  updateConnectivityStatusRef.current = updateConnectivityStatus;

  // Log initial state
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    console.log(
      `StoreGo Initial Network Status: ${isOnline ? "Online" : "Offline"} (browser: ${
        state.browserOnline ? "connected" : "disconnected"
      }, connectivity: ${state.hasConnectivity ? "yes" : "no"})`,
    );
  }, [isOnline, state.browserOnline, state.hasConnectivity]);

  // Set up event listeners for online/offline events
  useEffect(() => {
    // Handler for online browser status changes
    const handleOnline = () => {
      console.log("StoreGo Browser reported online");
      setState((prev) => ({
        ...prev,
        browserOnline: true,
        // Reset failure count when browser reports online
        failureCount: 0,
      }));

      // Immediately check connectivity when browser reports online
      updateConnectivityStatus();
    };

    // Handler for offline browser status changes
    const handleOffline = () => {
      console.log("StoreGo Browser reported offline");
      setState((prev) => ({
        ...prev,
        browserOnline: false,
        hasConnectivity: false,
        lastChanged: new Date(),
      }));

      // Store offline status in sessionStorage
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(
            "network-connectivity-status",
            JSON.stringify({
              browserOnline: false,
              hasConnectivity: false,
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (error) {
        // Ignore sessionStorage errors
      }

      // Schedule next check with offline interval
      scheduleNextCheck();
    };

    // Add event listeners for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Initial connectivity check
      updateConnectivityStatus();
    }

    // Cleanup: Remove event listeners and clear interval on unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }

      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [updateConnectivityStatus, scheduleNextCheck]);

  return {
    isOnline,
    lastChanged: state.lastChanged,
    checking: state.checking,
    browserOnline: state.browserOnline,
    hasConnectivity: state.hasConnectivity,
    checkConnectivity,
  };
}
