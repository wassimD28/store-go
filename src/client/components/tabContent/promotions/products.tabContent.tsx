"use client";

import { useState, useEffect } from "react";
import { Card } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Skeleton } from "@/client/components/ui/skeleton";
import { AlertCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getProductsByIds } from "@/app/actions/product.actions";
import { formatCurrency } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/client/components/ui/alert";

interface ProductsTabContentProps {
  promotion: {
    id: string;
    storeId: string;
    discountType: string;
    applicableProducts: string[];
    applicableCategories: string[];
    yApplicableProducts?: string[];
    yApplicableCategories?: string[];
    buyQuantity?: number | null;
    getQuantity?: number | null;
    sameProductOnly?: boolean;
  };
}

type Product = {
  id: string;
  name: string;
  price: string;
  image_urls: string[];
  categoryId?: string;
  stock_quantity: number;
  sku: string;
};

export default function ProductsTabContent({
  promotion,
}: ProductsTabContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [yProducts, setYProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isBuyXGetY = promotion.discountType === "buy_x_get_y";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch primary products (applicable to all promotion types)
        if (
          promotion.applicableProducts &&
          promotion.applicableProducts.length > 0
        ) {
          const result = await getProductsByIds(
            promotion.storeId,
            promotion.applicableProducts,
          );
          if (result.success && result.data) {
            setProducts(result.data);
          } else {
            setError("Failed to load applicable products");
          }
        }

        // Fetch Y products if this is a Buy X Get Y promotion
        if (
          isBuyXGetY &&
          promotion.yApplicableProducts &&
          promotion.yApplicableProducts.length > 0 &&
          !promotion.sameProductOnly
        ) {
          const yResult = await getProductsByIds(
            promotion.storeId,
            promotion.yApplicableProducts,
          );
          if (yResult.success && yResult.data) {
            setYProducts(yResult.data);
          }
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [promotion, isBuyXGetY]);

  if (loading) {
    return <ProductsLoadingSkeleton isBuyXGetY={isBuyXGetY} />;
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  } // Handle case when no products or categories are applicable at all
  if (
    (!products || products.length === 0) &&
    (!yProducts || yProducts.length === 0) &&
    (!promotion.applicableCategories ||
      promotion.applicableCategories.length === 0) &&
    (!promotion.yApplicableCategories ||
      promotion.yApplicableCategories.length === 0)
  ) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-lg border bg-muted/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Store-wide Promotion</h3>
          <p className="text-muted-foreground">
            This promotion applies to all products in the store.
          </p>
          <Badge className="mt-4" variant="outline">
            Universal Promotion
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-3">
      {/* Main products section */}
      {products && products.length > 0 ? (
        <>
          <div className="mb-4">
            <h3 className="flex items-center text-lg font-semibold">
              {isBuyXGetY ? (
                <>
                  <Badge variant="outline" className="mr-2">
                    X
                  </Badge>
                  Products to Buy
                </>
              ) : (
                "Applicable Products"
              )}
              <Badge className="ml-2" variant="secondary">
                {products.length}
              </Badge>
            </h3>
            {promotion.applicableCategories &&
              promotion.applicableCategories.length > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Plus</p>
                  <Badge variant="secondary" className="text-xs">
                    {promotion.applicableCategories.length}{" "}
                    {promotion.applicableCategories.length === 1
                      ? "category"
                      : "categories"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">of products</p>
                </div>
              )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : promotion.applicableCategories &&
        promotion.applicableCategories.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {isBuyXGetY ? "Products to Buy (X)" : "Applicable Products"}
          </h3>
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className="mr-2">
              {promotion.applicableCategories.length}{" "}
              {promotion.applicableCategories.length === 1
                ? "category"
                : "categories"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              This promotion applies to all products in{" "}
              {promotion.applicableCategories.length === 1
                ? "this category"
                : "these categories"}
              .
            </p>
          </div>
        </div>
      ) : null}

      {/* "Y" products section - only for Buy X Get Y promotions */}
      {isBuyXGetY && (
        <>
          <hr className="my-6" />{" "}
          {promotion.sameProductOnly ? (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Products to Get (Y)</h3>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="secondary">Same Product</Badge>
                <p className="text-sm text-muted-foreground">
                  Discount applies to the same product(s) that the customer
                  purchases.
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Example: Buy {promotion.buyQuantity || 2}, get{" "}
                {promotion.getQuantity || 1} of the same product for free or at
                a discount.
              </p>
            </div>
          ) : yProducts && yProducts.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-semibold">
                  <Badge variant="outline" className="mr-2">
                    Y
                  </Badge>
                  Products to Get
                  <Badge className="ml-2" variant="secondary">
                    {yProducts.length}
                  </Badge>
                </h3>
                {promotion.yApplicableCategories &&
                  promotion.yApplicableCategories.length > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">Plus</p>
                      <Badge variant="secondary" className="text-xs">
                        {promotion.yApplicableCategories.length}{" "}
                        {promotion.yApplicableCategories.length === 1
                          ? "category"
                          : "categories"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        of products
                      </p>
                    </div>
                  )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {yProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : promotion.yApplicableCategories &&
            promotion.yApplicableCategories.length > 0 ? (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Products to Get (Y)</h3>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="mr-2">
                  {promotion.yApplicableCategories.length}{" "}
                  {promotion.yApplicableCategories.length === 1
                    ? "category"
                    : "categories"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Discount applies to all products in{" "}
                  {promotion.yApplicableCategories.length === 1
                    ? "this category"
                    : "these categories"}
                  .
                </p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const imageUrl =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : "/images/placeholder-category.png";

  // Determine stock status
  const stockStatus = () => {
    if (!product.stock_quantity)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stock_quantity < 5)
      return { label: "Low Stock", variant: "outline" as const };
    return { label: "In Stock", variant: "secondary" as const };
  };

  const status = stockStatus();

  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 w-full bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <Badge
          className="absolute right-1 top-1 text-[10px]"
          variant={status.variant}
        >
          {status.label}
        </Badge>
      </div>
      <div className="p-2">
        <h4 className="line-clamp-1 text-sm font-medium">{product.name}</h4>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-semibold">
            {formatCurrency(parseFloat(product.price))}
          </p>
          <Badge variant="outline" className="text-[10px]">
            {product.sku || "No SKU"}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

// Loading Skeleton Component
const ProductsLoadingSkeleton = ({ isBuyXGetY }: { isBuyXGetY: boolean }) => {
  return (
    <div className="space-y-6 px-4 py-3">
      <div className="mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-1 h-4 w-32" />
      </div>{" "}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-24 w-full" />
            <div className="p-2">
              <Skeleton className="mb-2 h-4 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {isBuyXGetY && (
        <>
          <hr className="my-6" />
          <div className="mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>{" "}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-24 w-full" />
                <div className="p-2">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
