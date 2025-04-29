interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;
  return (
    <div className="flex h-full w-full items-center justify-center text-2xl uppercase">
      Store ID: {storeId}
    </div>
  );
}
