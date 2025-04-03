"use client";

import CreateStoreForm from "@/client/components/forms/product/createStoreForm";


export default function Page() {
  return (
    <div className="flex h-full w-full flex-col p-4">
      {/* store category list */}
        <CreateStoreForm/>
    </div>
  );
}