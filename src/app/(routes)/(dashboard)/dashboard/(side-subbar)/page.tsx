import { getUserStores } from "@/app/actions/store.actions";
import StoreCard from "@/client/components/card/storeCard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AButton } from "@/client/components/ui/animated-button";
import { Plus } from "lucide-react";
import Link from "next/link";

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
  const { success, data: stores, error } = await getUserStores(session.user.id);

  if (!success || !stores) {
    // Handle error state
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <p className="text-red-500">Failed to load stores: {error}</p>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col p-4">
      {/* Display stores */}
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Stores</h1>
          <Link href="/dashboard/new">
            <AButton
              variant="default"
              effect="expandIcon"
              icon={Plus}
              iconPlacement="left"
              className="gap-2"
            >
              Create Store
            </AButton>
          </Link>
        </div>

        {stores.length === 0 ? (
          <p className="text-gray-500">You don&apos;t have any stores yet.</p>
        ) : (
          stores.map((store) => <StoreCard key={store.id} store={store} />)
        )}
      </div>
    </div>
  );
}
