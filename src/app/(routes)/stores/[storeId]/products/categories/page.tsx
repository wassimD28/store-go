import { getAppCategories } from "@/app/actions/category.actions";
import { CategoryTableClient } from "@/client/components/data-table/colums/category.colums"; // You'll need to create this file
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ storeId: string }> | { storeId: string };
}

async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId } = resolvedParams;

  const categoriesResult = await getAppCategories(storeId);

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link href={`/stores/${storeId}/products/categories/new`}>
          <button className="flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </button>
        </Link>
      </div>

      {!categoriesResult.success || !categoriesResult.categories ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{categoriesResult.error || "Failed to fetch categories"}</p>
            <button
              className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      ) : (
        <CategoryTableClient categories={categoriesResult.categories} />
      )}
    </div>
  );
}

export default Page;
