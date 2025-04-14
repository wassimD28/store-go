"use client"
import { useHeaderStore } from "@/client/store/header.store";
import { useStoreStore } from "@/client/store/store.store";
import Link from "next/link";

interface props {
  store: {
    id: string;
    name: string;
    logoUrl: string | null;
    category: {
      id: string;
      name: string | null;
    };
  };
}
function StoreCard({ store }: props) {
  const { setStore } = useStoreStore()
  const { setBreadcrumbItems } = useHeaderStore();

  const handleOnClick = () =>{
    setStore(store);
    setBreadcrumbItems([
      { name: store.name, route: `/stores/${store.id}` },
    ]);
  }
  return (
    <Link
      href={`/stores/${store.id}`}
      className="flex flex-col rounded-lg bg-background p-4 shadow-custom-xl dark:bg-foreground/5 w-80 h-44"
      onClick={handleOnClick}
    >
      <h1 className="text-2xl first-letter:uppercase">{store.name}</h1>
      <span className="rounded-md border border-border px-2 py-1 text-xs w-fit">
        {store.category.name}
      </span>
     
    </Link>
  );
}

export default StoreCard;
