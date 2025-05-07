import { VercelStyleTemplates } from "@/client/components/data-table/tables/vercel-style-templates";

interface Props {
  params: Promise<{ storeId: string }>;
}

async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { storeId } = resolvedParams;

  return (
    <div className="h-full w-full p-6">
      <VercelStyleTemplates storeId={storeId} />
    </div>
  );
}

export default Page;
