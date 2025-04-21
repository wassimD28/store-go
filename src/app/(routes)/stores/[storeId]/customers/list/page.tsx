/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getAppUsersByStoreId } from "@/app/actions/appUser.actions";
import { AppUserTableClient } from "@/client/components/data-table/tables/app-user.table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { UserStatusProvider } from "@/client/contexts/UserStatusContext";
import { useState, useEffect } from "react";
import { use } from "react"; // Import React.use

interface Props {
  params: { storeId: string } | Promise<{ storeId: string }>;
}

function CustomersListPage({ params }: Props) {
  // TypeScript needs help understanding what will come out of use(params)
  const resolvedParams = use(params as any) as { storeId: string };
  const { storeId } = resolvedParams;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAppUsersByStoreId(storeId);
      if (result.success) {
        setUsers(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch customers");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return (
    <div className="h-full w-full p-4">
      <UserStatusProvider storeId={storeId}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customers</h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchUsers}
              className="rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div>Loading customers...</div>
        ) : error ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <button
                className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                onClick={fetchUsers}
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No Customers Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                No customers have registered through your app yet. Users will
                appear here after they register through the mobile application
                linked to your store.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AppUserTableClient users={users} storeId={storeId} />
        )}
      </UserStatusProvider>
    </div>
  );
}

export default CustomersListPage;
