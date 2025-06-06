import { getAppCategories } from "@/app/actions/category.actions";
import { getProductsByStore } from "@/app/actions/product.actions";
import { getAppSubCategories } from "@/app/actions/subCategory.actions";
import { ProductTableClient } from "@/client/components/data-table/tables/product.table";
import { ColorOption } from "@/client/components/selector/multiColorSelector";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ storeId: string }>;
  searchParams?: Promise<{
    productId?: string;
    tab?: string;
  }>;
}

async function Page({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const { storeId } = resolvedParams;

  // Resolve searchParams before accessing its properties
  const resolvedSearchParams = await searchParams || {};
  const productIdToSelect = resolvedSearchParams.productId;
  const tabToOpen = resolvedSearchParams.tab;

  // Fetch products, categories, and subcategories
  const productsResult = await getProductsByStore(storeId);
  const categoriesResult = await getAppCategories(storeId);
  const subcategoriesResult = await getAppSubCategories(storeId);

  // Create mappings for category and subcategory names
  const categoryIdToName: Record<string, string> = {};
  if (categoriesResult.success && categoriesResult.categories) {
    categoriesResult.categories.forEach((category) => {
      categoryIdToName[category.id] = category.name;
    });
  }

  const subcategoryIdToName: Record<string, string> = {};
  if (subcategoriesResult.success && subcategoriesResult.subcategories) {
    subcategoriesResult.subcategories.forEach((subcategory) => {
      subcategoryIdToName[subcategory.id] = subcategory.name;
    });
  }

  // Enhanced type handling for products to support new schema fields
  const typedProducts = productsResult.products
    ? productsResult.products.map((product) => ({
        ...product,
        image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: product.attributes || ({} as any), // Add type assertion here
        colors: Array.isArray(product.colors)
          ? (product.colors as ColorOption[])
          : [],
        size: Array.isArray(product.size) ? product.size : [],
        targetGender: product.targetGender || "unisex",
        unitsSold: product.unitsSold || 0,
      }))
    : [];

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex space-x-2">
          <Link href={`/stores/${storeId}/products/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {!productsResult.success ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{productsResult.error || "Failed to fetch products"}</p>
            <button
              className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      ) : productsResult.products && productsResult.products.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Products Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You haven&apos;t added any products yet. Click the &quot;Add
              Product&quot; button to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProductTableClient
          products={typedProducts}
          categoryNames={categoryIdToName}
          subcategoryNames={subcategoryIdToName}
          initialProductId={productIdToSelect}
          initialTab={tabToOpen}
        />
      )}
    </div>
  );
}

export default Page;
