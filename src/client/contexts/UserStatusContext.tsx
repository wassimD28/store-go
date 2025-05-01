/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Pusher from "pusher-js";

interface UserStatus {
  [userId: string]: {
    isOnline: boolean;
    lastSeen: Date | null;
  };
}

interface UserStatusContextType {
  userStatus: UserStatus;
  updateUserStatus: (
    userId: string,
    isOnline: boolean,
    lastSeen?: Date,
  ) => void;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(
  undefined,
);

export function UserStatusProvider({
  children,
  storeId,
}: {
  children: ReactNode;
  storeId: string;
}) {
  const [userStatus, setUserStatus] = useState<UserStatus>({});

  const updateUserStatus = (
    userId: string,
    isOnline: boolean,
    lastSeen?: Date,
  ) => {
    setUserStatus((prev) => {
      const updated = {
        ...prev,
        [userId]: {
          isOnline,
          lastSeen:
            lastSeen ||
            (isOnline ? new Date() : prev[userId]?.lastSeen || null),
        },
      };
      console.log("Updated userStatus:", updated); // Debug log
      return updated;
    });
  };

  // Modify your UserStatusContext.tsx to implement timeout logic
  useEffect(() => {
    if (!storeId) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to the public channel
    const channelName = `store-${storeId}`;
    const channel = pusher.subscribe(channelName);

    // Handle user status change events
    channel.bind("user-status-changed", (data: any) => {
      const { userId, isOnline, lastSeen } = data;
      updateUserStatus(
        userId,
        isOnline,
        lastSeen ? new Date(lastSeen) : undefined,
      );
    });

    // Implement timeout check interval
    const timeoutInterval = setInterval(() => {
      setUserStatus((current) => {
        const updated = { ...current };
        const now = new Date().getTime();

        // Check each user status
        Object.keys(updated).forEach((userId) => {
          const user = updated[userId];
          if (user.isOnline && user.lastSeen) {
            const lastActivity = new Date(user.lastSeen).getTime();
            const inactiveTime = now - lastActivity;

            // If last activity was more than 3 minutes ago, mark as offline
            if (inactiveTime > 3 * 60 * 1000) {
              updated[userId] = {
                ...user,
                isOnline: false,
              };
            }
          }
        });

        return updated;
      });
    }, 60000); // Check every minute

    // Cleanup function
    return () => {
      clearInterval(timeoutInterval);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [storeId]);

  return (
    <UserStatusContext.Provider value={{ userStatus, updateUserStatus }}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error("useUserStatus must be used within a UserStatusProvider");
  }
  return context;
}
