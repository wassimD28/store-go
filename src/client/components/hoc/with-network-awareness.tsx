"use client";

import { ComponentType, useState } from "react";
import { useOnlineStatus } from "@/client/hooks/use-online-status";

interface WithNetworkAwarenessProps {
  isOnline: boolean;
  retry: () => void;
}

/**
 * Higher-Order Component that adds network awareness to components
 * It passes isOnline status and a retry function to the wrapped component
 */
export function withNetworkAwareness<
  T extends WithNetworkAwarenessProps = WithNetworkAwarenessProps,
>(WrappedComponent: ComponentType<T>) {
  return function WithNetworkAwareness(
    props: Omit<T, keyof WithNetworkAwarenessProps>,
  ) {
    const { isOnline } = useOnlineStatus();
    const [retryCount, setRetryCount] = useState(0);

    // Function to trigger retries
    const retry = () => {
      setRetryCount((prev) => prev + 1);
    };

    // Pass the enhanced props to the wrapped component
    return (
      <WrappedComponent {...(props as T)} isOnline={isOnline} retry={retry} />
    );
  };
}
