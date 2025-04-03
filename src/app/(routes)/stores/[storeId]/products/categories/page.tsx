
import { getAppCategories } from "@/app/actions/category.actions";
import { getAppSubCategories } from "@/app/actions/subCategory.actions";
import { CategoryTableClient } from "@/client/components/data-table/tables/category.table";
import { SubCategoryTableClient } from "@/client/components/data-table/tables/subcategory.table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ storeId: string }> | { storeId: string };
}

async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId } = resolvedParams;

  // Fetch both categories and subcategories
  const categoriesResult = await getAppCategories(storeId);
  const subcategoriesResult = await getAppSubCategories(storeId);

  // Create a mapping of category IDs to names for the subcategory table
  const categoryIdToName: Record<string, string> = {};
  if (categoriesResult.success && categoriesResult.categories) {
    categoriesResult.categories.forEach((category) => {
      categoryIdToName[category.id] = category.name;
    });
  }

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Categories</h2>
        <div className="flex space-x-2">
          <Link href={`/stores/${storeId}/products/categories/new`}>
            <button className="flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </button>
          </Link>
          <Link href={`/stores/${storeId}/products/subcategories/new`}>
            <button className="flex items-center rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subcategory
            </button>
          </Link>
        </div>
      </div>

      {(!categoriesResult.success && !categoriesResult.categories) ||
      (!subcategoriesResult.success && !subcategoriesResult.subcategories) ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {categoriesResult.error ||
                subcategoriesResult.error ||
                "Failed to fetch categories or subcategories"}
            </p>
            <button
              className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoryTableClient
              categories={categoriesResult.categories || []}
            />
          </TabsContent>

          <TabsContent value="subcategories">
            <SubCategoryTableClient
              subcategories={subcategoriesResult.subcategories || []}
              parentCategories={categoryIdToName}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default Page;
