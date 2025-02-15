"use client";
import { Button } from "@/client/components/ui/button";
import { signIn, useSession } from "@/lib/auth-client";
import { useEffect } from "react";
function Page() {
  const { data: session } = useSession();
  useEffect(() => {
    console.log("session :", session);
  }, [session]);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-600 text-white">
      <Button
        onClick={async () =>
          signIn.social({
            provider: "google",
            callbackURL: "/",
          })
        }
      >
        sign in with google
      </Button>
    </div>
  );
}

export default Page;
