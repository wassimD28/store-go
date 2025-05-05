import Link from "next/link";
import { Button } from "@/client/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomStoreTemplatesClient } from "@/client/components/data-table/tables/customTemplates.table";

interface Props {
  params: Promise<{ storeId: string }>;
}

async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { storeId } = resolvedParams;

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Store Customizations</h2>
        <div className="flex space-x-2">
          <Link href={`/stores/${storeId}/templates/select`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Customization
            </Button>
          </Link>
        </div>
      </div>

      <CustomStoreTemplatesClient storeId={storeId} />
    </div>
  );
}

export default Page;
