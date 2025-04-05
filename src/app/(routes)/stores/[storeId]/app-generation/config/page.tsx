interface Props {
  params: Promise<{ storeId: string }> | { storeId: string };
}
async function ConfigPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId } = resolvedParams;
  return (
    <div className="flex-center text-2xl p-3">
      config page withe storId :{storeId}
    </div>
  );
}

export default ConfigPage;
