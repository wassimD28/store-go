import { getAppUsersByStoreId } from "@/app/actions/appUser.actions";
import { AppUserTableClient } from "@/client/components/data-table/tables/app-user.table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";


interface Props {
  params: Promise<{ storeId: string }> | { storeId: string };
}

async function CustomersListPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId } = resolvedParams;

  // Fetch app users for this store
  const usersResult = await getAppUsersByStoreId(storeId);

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex space-x-2">
          
        </div>
      </div>

      {!usersResult.success ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{usersResult.error || "Failed to fetch customers"}</p>
            <button
              className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      ) : usersResult.data && usersResult.data.length === 0 ? (
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
        <AppUserTableClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          users={usersResult.data as any} 
          storeId={storeId}
        />
      )}
    </div>
  );
}

export default CustomersListPage;
