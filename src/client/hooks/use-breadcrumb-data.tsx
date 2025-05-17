"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useStoreStore } from "@/client/store/store.store";
import { getStoreById } from "@/app/actions/store.actions";
import { getProductById } from "@/app/actions/product.actions";
import { getCategoryById } from "@/app/actions/category.actions";
import { getPromotionById } from "@/app/actions/promotion.actions";

// Improved type definition
type BreadcrumbData = {
  storeNames: Record<string, string>;
  productNames: Record<string, string>;
  categoryNames: Record<string, string>;
  promotionNames: Record<string, string>;
};

// Cache time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Enhanced hook to fetch and cache entity names for breadcrumb display
 * with improved reliability and better integration with store context
 */
export function useBreadcrumbData() {
  const pathname = usePathname();
  const { store } = useStoreStore();
  const [data, setData] = useState<BreadcrumbData>({
    storeNames: {},
    productNames: {},
    categoryNames: {},
    promotionNames: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<
    Record<string, { fetched: boolean; timestamp: number }>
  >({});
  // Extract IDs from the current path
  const extractIdsFromPath = useCallback((path: string) => {
    const pathSegments = path.split("/").filter((segment) => segment);
    const ids = {
      storeId: null as string | null,
      productId: null as string | null,
      categoryId: null as string | null,
      promotionId: null as string | null,
    };

    // Find store ID (comes after "stores/" segment)
    const storeIdIndex = pathSegments.findIndex(
      (segment) => segment === "stores",
    );
    if (
      storeIdIndex !== -1 &&
      storeIdIndex + 1 < pathSegments.length &&
      // Improved ID detection for various ID formats (UUID or MongoDB ObjectId)
      (pathSegments[storeIdIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[storeIdIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.storeId = pathSegments[storeIdIndex + 1];
    } // Find product ID (comes after "products/" segment and is not "list", "categories", etc.)
    const productIdIndex = pathSegments.findIndex(
      (segment) => segment === "products",
    );
    if (
      productIdIndex !== -1 &&
      productIdIndex + 1 < pathSegments.length &&
      pathSegments[productIdIndex + 1] !== "list" &&
      pathSegments[productIdIndex + 1] !== "new" &&
      pathSegments[productIdIndex + 1] !== "categories" &&
      pathSegments[productIdIndex + 1] !== "attributes" &&
      pathSegments[productIdIndex + 1] !== "inventory" &&
      (pathSegments[productIdIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[productIdIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.productId = pathSegments[productIdIndex + 1];
    }

    // Find product ID from edit path structure (products/edit/[productId])
    const productsEditIndex = pathSegments.indexOf("products");
    const editIndex = pathSegments.indexOf("edit");
    if (
      productsEditIndex !== -1 &&
      editIndex !== -1 &&
      editIndex > productsEditIndex &&
      editIndex + 1 < pathSegments.length &&
      (pathSegments[editIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[editIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.productId = pathSegments[editIndex + 1];
    } // Find category ID (comes after "categories/" segment)
    const categoryIdIndex = pathSegments.findIndex(
      (segment) => segment === "categories",
    );
    if (
      categoryIdIndex !== -1 &&
      categoryIdIndex + 1 < pathSegments.length &&
      pathSegments[categoryIdIndex + 1] !== "new" &&
      (pathSegments[categoryIdIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[categoryIdIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.categoryId = pathSegments[categoryIdIndex + 1];
    }

    // Find category ID from edit path structure (categories/edit/[categoryId])
    const categoriesEditIndex = pathSegments.indexOf("categories");
    if (
      categoriesEditIndex !== -1 &&
      editIndex !== -1 &&
      editIndex > categoriesEditIndex &&
      editIndex + 1 < pathSegments.length &&
      (pathSegments[editIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[editIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.categoryId = pathSegments[editIndex + 1];
    } // Find promotion ID (comes after "promotions/(create&edit)/edit/" segment)
    const promotionsIndex = pathSegments.findIndex(
      (segment) => segment === "promotions",
    );

    if (
      promotionsIndex !== -1 &&
      editIndex !== -1 &&
      editIndex + 1 < pathSegments.length &&
      editIndex > promotionsIndex &&
      (pathSegments[editIndex + 1]?.match(/^[a-f0-9]{24}$/i) ||
        pathSegments[editIndex + 1]?.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ))
    ) {
      ids.promotionId = pathSegments[editIndex + 1];
    }

    // After extracting all IDs, log them for debugging
    console.log("Path segments:", pathSegments);
    console.log("Extracted IDs:", ids);

    return ids;
  }, []);

  // Check if a cached item is still valid
  const isCacheValid = useCallback(
    (key: string) => {
      const status = fetchStatus[key];
      if (!status) return false;

      const now = Date.now();
      return status.fetched && now - status.timestamp < CACHE_EXPIRY;
    },
    [fetchStatus],
  );

  // Initialize data from store context when available
  useEffect(() => {
    if (store) {
      setData((prevData) => ({
        ...prevData,
        storeNames: {
          ...prevData.storeNames,
          [store.id]: store.name,
        },
      }));

      // Mark this store as fetched in the fetch status
      setFetchStatus((prev) => ({
        ...prev,
        [`store-${store.id}`]: { fetched: true, timestamp: Date.now() },
      }));
    }
  }, [store]);
  // Fetch data based on the current path
  const fetchData = useCallback(async () => {
    const { storeId, productId, categoryId, promotionId } =
      extractIdsFromPath(pathname);

    // Track what we need to fetch
    const toFetch = [];

    // Only fetch if we have IDs and the cache isn't valid
    if (
      storeId &&
      !data.storeNames[storeId] &&
      !isCacheValid(`store-${storeId}`) &&
      // Only fetch if it's not the current store in context
      !(store && store.id === storeId)
    ) {
      toFetch.push({ type: "store", id: storeId });
      setFetchStatus((prev) => ({
        ...prev,
        [`store-${storeId}`]: { fetched: true, timestamp: Date.now() },
      }));
    }

    if (
      productId &&
      !data.productNames[productId] &&
      !isCacheValid(`product-${productId}`)
    ) {
      toFetch.push({ type: "product", id: productId });
      setFetchStatus((prev) => ({
        ...prev,
        [`product-${productId}`]: { fetched: true, timestamp: Date.now() },
      }));
    }

    if (
      categoryId &&
      !data.categoryNames[categoryId] &&
      !isCacheValid(`category-${categoryId}`)
    ) {
      toFetch.push({ type: "category", id: categoryId });
      setFetchStatus((prev) => ({
        ...prev,
        [`category-${categoryId}`]: { fetched: true, timestamp: Date.now() },
      }));
    }

    if (
      promotionId &&
      !data.promotionNames[promotionId] &&
      !isCacheValid(`promotion-${promotionId}`)
    ) {
      toFetch.push({ type: "promotion", id: promotionId });
      setFetchStatus((prev) => ({
        ...prev,
        [`promotion-${promotionId}`]: { fetched: true, timestamp: Date.now() },
      }));
    }

    // If there's nothing to fetch, return early
    if (toFetch.length === 0) return;

    setIsLoading(true);

    try {
      // Process all fetch requests in parallel
      const results = await Promise.allSettled(
        toFetch.map(async (item) => {
          switch (item.type) {
            case "store":
              // First check if we already have this store in the store context
              if (store && store.id === item.id) {
                return { type: "store", id: item.id, name: store.name };
              }

              const storeResponse = await getStoreById(item.id);
              if (storeResponse.success && storeResponse.data) {
                return {
                  type: "store",
                  id: item.id,
                  name: storeResponse.data.name,
                };
              }

              console.warn(
                `Store fetch failed for ID ${item.id}:`,
                storeResponse.error,
              );
              return {
                type: "store",
                id: item.id,
                name: "Unknown Store",
                error: storeResponse.error,
              };

            case "product":
              const productResponse = await getProductById(item.id);
              if (productResponse.success && productResponse.product) {
                return {
                  type: "product",
                  id: item.id,
                  name: productResponse.product.name,
                };
              }

              console.warn(
                `Product fetch failed for ID ${item.id}:`,
                productResponse.error,
              );
              return {
                type: "product",
                id: item.id,
                name: "Unknown Product",
                error: productResponse.error,
              };
            case "category":
              const categoryResponse = await getCategoryById(item.id);
              if (categoryResponse.success && categoryResponse.category) {
                return {
                  type: "category",
                  id: item.id,
                  name: categoryResponse.category.name,
                };
              }

              console.warn(
                `Category fetch failed for ID ${item.id}:`,
                categoryResponse.error,
              );
              return {
                type: "category",
                id: item.id,
                name: "Unknown Category",
                error: categoryResponse.error,
              };

            case "promotion":
              const promotionResponse = await getPromotionById(item.id);
              if (promotionResponse.success && promotionResponse.promotion) {
                return {
                  type: "promotion",
                  id: item.id,
                  name: promotionResponse.promotion.name,
                };
              }

              console.warn(
                `Promotion fetch failed for ID ${item.id}:`,
                promotionResponse.error,
              );
              return {
                type: "promotion",
                id: item.id,
                name: "Unknown Promotion",
                error: promotionResponse.error,
              };

            default:
              return {
                type: item.type,
                id: item.id,
                name: "Unknown",
                error: "Unsupported entity type",
              };
          }
        }),
      );

      // Update the data state with the fetched results
      setData((prevData) => {
        const updatedData = { ...prevData };

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const { type, id, name } = result.value;
            switch (type) {
              case "store":
                updatedData.storeNames[id] = name;
                break;
              case "product":
                updatedData.productNames[id] = name;
                break;
              case "category":
                updatedData.categoryNames[id] = name;
                break;
              case "promotion":
                updatedData.promotionNames[id] = name;
                break;
            }
          }
        });

        return updatedData;
      });
    } catch (error) {
      console.error("Error fetching breadcrumb data:", error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, store, data, fetchStatus, extractIdsFromPath, isCacheValid]); // Force a refresh of the data
  const refetch = useCallback(() => {
    // Clear cache status for current path entities
    const { storeId, productId, categoryId, promotionId } =
      extractIdsFromPath(pathname);

    setFetchStatus((prevFetchStatus) => {
      const newFetchStatus = { ...prevFetchStatus };
      if (storeId) delete newFetchStatus[`store-${storeId}`];
      if (productId) delete newFetchStatus[`product-${productId}`];
      if (categoryId) delete newFetchStatus[`category-${categoryId}`];
      if (promotionId) delete newFetchStatus[`promotion-${promotionId}`];

      return newFetchStatus;
    });
    // This will trigger fetchData to run on the next cycle
  }, [pathname, extractIdsFromPath]); // Fetch data when the path changes or when store context changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Separate effect for handling edit paths - runs only when path changes
  useEffect(() => {
    if (pathname.includes("/edit/")) {
      console.log("Edit page detected, refreshing breadcrumb data");
      // Use a timeout to avoid multiple state updates in the same render cycle
      const timer = setTimeout(() => {
        refetch();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, refetch]);

  return { data, isLoading, refetch };
}
