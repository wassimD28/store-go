"use client";
import { Input } from "@/client/components/ui/input";
import { useLoginPageStore } from "../stores/login.store";

function LoginScreen() {
  const { inputPlaceholder } = useLoginPageStore();

  return (
    <div
      id="LoginScreen"
      className="h-full w-full overflow-hidden bg-black p-5 text-white"
    >
      <h1 className="mb-8 text-3xl font-bold">Login Screen</h1>
      <Input className="rounded-full" placeholder={inputPlaceholder} />

      {/* Display current store values for debugging */}
      <div className="mt-10 rounded-md bg-gray-900 p-4">
        <h3 className="mb-3 text-lg font-medium">Current Store Values:</h3>
        <pre className="overflow-auto text-xs">
          {JSON.stringify({ inputPlaceholder }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default LoginScreen;
