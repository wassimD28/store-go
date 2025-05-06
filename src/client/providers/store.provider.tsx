"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { getStoreById } from "@/app/actions/store.actions";

// Define the store data type based on your schema
type StoreCategory = {
  id: string;
  name: string | null;
};

type Store = {
  id: string;
  userId: string;
  name: string;
  logoUrl: string | null;
  appUrl: string | null;
  currency: string;
  category: StoreCategory;
  lastGeneratedAt: Date | null;
  createdAt: Date;
};

// Define the context value type
type StoreContextType = {
  store: Store | null;
  isLoading: boolean;
  error: string | null;
};

// Create the context with a default value
const StoreContext = createContext<StoreContextType>({
  store: null,
  isLoading: false,
  error: null,
});

// Custom hook to use the store context
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

// Props for the StoreProvider component
type StoreProviderProps = {
  children: ReactNode;
  storeId: string;
  initialStore?: Store | null;
};

// StoreProvider component that fetches and provides store data
export function StoreProvider({
  children,
  storeId,
  initialStore = null,
}: StoreProviderProps) {
  const [storeData, setStoreData] = useState<StoreContextType>({
    store: initialStore,
    isLoading: !initialStore, // If we have initial data, we're not loading
    error: null,
  });

  useEffect(() => {
    // If we already have the store data or there's no storeId, don't fetch
    if (storeData.store || !storeId) return;

    const fetchStore = async () => {
      try {
        const result = await getStoreById(storeId);

        if (result.success && result.data) {
          setStoreData({
            store: result.data,
            isLoading: false,
            error: null,
          });
        } else {
          setStoreData({
            store: null,
            isLoading: false,
            error: result.error || "Failed to load store data",
          });
        }
      } catch (error) {
        setStoreData({
          store: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    };

    fetchStore();
  }, [storeId, storeData.store]);

  return (
    <StoreContext.Provider value={storeData}>{children}</StoreContext.Provider>
  );
}
