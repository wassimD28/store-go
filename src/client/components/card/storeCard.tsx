import Image from "next/image";
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
  return (
    <Link
      href={`/stores/${store.id}`}
      className="flex flex-col rounded-lg bg-background p-4 shadow-xl dark:bg-foreground/5"
    >
      <h1 className="text-2xl first-letter:uppercase">{store.name}</h1>
      <span className="rounded-md border border-border px-2 py-1 text-xs">
        {store.category.name}
      </span>
      <Image
        src={
          store.logoUrl == "" || store.logoUrl == null
            ? "/unknown.png"
            : store.logoUrl
        }
        width={100}
        height={100}
        alt={`logoUrl-${store.name}`}
      />
    </Link>
  );
}

export default StoreCard;
