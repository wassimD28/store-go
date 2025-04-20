/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";

interface UserStatusListenerProps {
  storeId: string;
}

export function UserStatusListener({ storeId }: UserStatusListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to the presence channel for this store
    const channel = pusher.subscribe(`presence-store-${storeId}`);

    // Listen for member_added event (someone came online)
    channel.bind("pusher:member_added", (member: any) => {
      console.log("User came online:", member);
      router.refresh(); // Refresh the page to update the UI
    });

    // Listen for member_removed event (someone went offline)
    channel.bind("pusher:member_removed", (member: any) => {
      console.log("User went offline:", member);
      router.refresh(); // Refresh the page to update the UI
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`presence-store-${storeId}`);
      pusher.disconnect();
    };
  }, [storeId, router]);

  return null; // This component doesn't render anything
}
