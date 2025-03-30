import { getUserStores } from "@/app/actions/store.actions";
import StoreCard from "@/client/components/card/storeCard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Ensure user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if no session exists
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user's stores using the server action
  const { success, data:stores, error } = await getUserStores(session.user.id);

  if (!success || !stores) {
    // Handle error state
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <p className="text-red-500">Failed to load stores: {error}</p>
      </div>
    );
  }
  return (
    <div className="flex-center flex h-full w-full flex-col p-4">
      {/* Display stores */}
      <div className="w-full max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold">Your Stores</h1>

        {stores.length === 0 ? (
          <p className="text-gray-500">You don&apos;t have any stores yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
