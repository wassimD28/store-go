export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return (
    <div className="flex-center p-3 text-2xl">
      config page with storeId: {storeId}
    </div>
  );
}
