import UpdateProductForm from "@/client/components/forms/product/updateProdcutForm";
import { Suspense } from "react";

// Define the component props interface
interface Props {
  params:
    | Promise<{ storeId: string; productId: string }>
    | { storeId: string; productId: string };
}

export default async function EditProductPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId, productId } = resolvedParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Product</h1>

      <Suspense
        fallback={<div className="text-center">Loading product data...</div>}
      >
        <UpdateProductForm storeId={storeId} productId={productId} />
      </Suspense>
    </div>
  );
}
