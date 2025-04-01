interface StorePageProps {
  params: {
    storeId: string;
  };
}

export default function StorePage({ params }: StorePageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center text-2xl uppercase">
      Store ID: {params.storeId}
    </div>
  );
}
