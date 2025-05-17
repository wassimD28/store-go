"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/client/store/user.store";
import { useStoreStore } from "@/client/store/store.store";
import { useBreadcrumbData } from "@/client/hooks/use-breadcrumb-data";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { getFirstName } from "@/lib/utils";

// Enhanced segment mapping type
type SegmentInfo = {
  displayName: string;
  href: string;
  isPage: boolean;
  isLoading?: boolean;
  context?: "store" | "product" | "category" | "user" | "promotion"; // Context helps with special styling
  id?: string; // Store actual IDs for reference
};

export function EnhancedBreadcrumb() {
  const pathname = usePathname();
  const { user } = useUserStore();
  const { store } = useStoreStore();
  const { data, isLoading } = useBreadcrumbData();

  // State to hold the processed breadcrumb segments
  const [breadcrumbSegments, setBreadcrumbSegments] = useState<SegmentInfo[]>(
    [],
  );

  // Process the path into user-friendly segments
  useEffect(() => {
    // Debug logging for breadcrumb data
    console.log("Breadcrumb data:", data);

    // Split the path and filter out empty segments
    const pathSegments = pathname.split("/").filter((segment) => segment);
    const processedSegments: SegmentInfo[] = [];

    // For root path or dashboard, show user's stores if available
    if (
      pathSegments.length === 0 ||
      (pathSegments.length === 1 && pathSegments[0] === "dashboard")
    ) {
      const displayName = user
        ? `${getFirstName(user.name)}'s Stores`
        : "Dashboard";
      const href = pathSegments.length === 0 ? "/" : "/dashboard";

      processedSegments.push({
        displayName,
        href,
        isPage: true,
        context: "user",
        id: user?.id,
      });

      // Return early since we've handled the complete breadcrumb
      setBreadcrumbSegments(processedSegments);
      return;
    }

    // Start with user's stores for non-root paths
    if (user) {
      processedSegments.push({
        displayName: `${getFirstName(user.name)}'s Stores`,
        href: "/dashboard",
        isPage: false,
        context: "user",
        id: user?.id,
      });
    } else {
      // Fallback if no user is available
      processedSegments.push({
        displayName: "Dashboard",
        href: "/dashboard",
        isPage: false,
      });
    }

    // Build the path progressively for hrefs
    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      const isLastSegment = i === pathSegments.length - 1;

      // Skip dashboard segment if it's the first one - we've already added it
      if (segment === "dashboard" && i === 0) {
        continue;
      } else if (segment === "stores" && pathSegments[i + 1]) {
        // This is the stores route, skip the "stores" segment itself
        continue;
      } else if (pathSegments[i - 1] === "stores") {
        // This is a store ID - use store name if available
        const storeId = segment;

        // Try to get the store name from different sources with priority:
        // 1. Current store context (fastest and most reliable)
        // 2. Breadcrumb data cache
        // 3. Fall back to loading state or placeholder
        const storeName =
          (store && store.id === storeId ? store.name : null) ||
          data.storeNames[storeId];

        processedSegments.push({
          displayName: storeName || "Store Details",
          href: currentPath,
          isPage: isLastSegment,
          isLoading: !storeName && isLoading,
          context: "store",
          id: storeId,
        });
      } else if (segment === "team") {
        processedSegments.push({
          displayName: "Team Management",
          href: currentPath,
          isPage: isLastSegment,
        });
      } else if (
        [
          "products",
          "templates",
          "promotions",
          "orders",
          "app-generation",
          "analytics",
          "settings",
        ].includes(segment)
      ) {
        // These are section names that should be capitalized and included
        processedSegments.push({
          displayName: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isPage: isLastSegment,
        });
      } else if (
        [
          "list",
          "categories",
          "attributes",
          "inventory",
          "new",
          "edit",
          "pages",
          "theme",
          "config",
          "preview",
          "build",
          "history",
          "downloads",
          "members",
          "roles",
          "invitations",
          "account",
          "security",
          "notifications",
        ].includes(segment)
      ) {
        // These are subsection names that should be capitalized and included
        processedSegments.push({
          displayName: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isPage: isLastSegment,
        });
      } else if (
        pathSegments[i - 1] === "products" &&
        segment.match(
          /^([a-f0-9]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
        )
      ) {
        // This is a product ID - use product name if available
        const productId = segment;
        const productName = data.productNames[productId];

        processedSegments.push({
          displayName: productName || "Product Details",
          href: currentPath,
          isPage: isLastSegment,
          isLoading: !productName && isLoading,
          context: "product",
          id: productId,
        });
      } else if (
        pathSegments[i - 1] === "categories" &&
        segment.match(
          /^([a-f0-9]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
        )
      ) {
        // This is a category ID - use category name if available
        const categoryId = segment;
        const categoryName = data.categoryNames[categoryId];

        processedSegments.push({
          displayName: categoryName || "Category Details",
          href: currentPath,
          isPage: isLastSegment,
          isLoading: !categoryName && isLoading,
          context: "category",
          id: categoryId,
        });
      } else if (
        pathSegments[i - 1] === "edit" &&
        segment.match(
          /^([a-f0-9]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
        )
      ) {
        // This could be an edit page for either a product or a promotion
        const entityId = segment; // Check what type of entity is being edited by examining the path
        const promotionsIndex = pathSegments.indexOf("promotions");
        const categoriesIndex = pathSegments.indexOf("categories");

        // Determine the entity type
        const isPromotionEdit =
          promotionsIndex !== -1 &&
          pathSegments.includes("edit") &&
          pathSegments.indexOf("edit") > promotionsIndex;

        const isCategoryEdit =
          categoriesIndex !== -1 &&
          pathSegments.includes("edit") &&
          pathSegments.indexOf("edit") > categoriesIndex;

        if (isPromotionEdit) {
          // It's a promotion
          const promotionName = data.promotionNames[entityId];

          processedSegments.push({
            displayName: promotionName ? `${promotionName}` : "Edit Promotion",
            href: currentPath,
            isPage: isLastSegment,
            isLoading: !promotionName && isLoading,
            context: "promotion",
            id: entityId,
          });
        } else if (isCategoryEdit) {
          // It's a category
          const categoryName = data.categoryNames[entityId];

          processedSegments.push({
            displayName: categoryName ? `${categoryName}` : "Edit Category",
            href: currentPath,
            isPage: isLastSegment,
            isLoading: !categoryName && isLoading,
            context: "category",
            id: entityId,
          });
        } else {
          // Get product context from path
          const productsIndex = pathSegments.indexOf("products");
          const isProductEdit =
            productsIndex !== -1 &&
            pathSegments.includes("edit") &&
            pathSegments.indexOf("edit") > productsIndex;

          if (isProductEdit) {
            // It's a product
            const productName = data.productNames[entityId];

            processedSegments.push({
              displayName: productName ? `${productName}` : "Edit Product",
              href: currentPath,
              isPage: isLastSegment,
              isLoading: !productName && isLoading,
              context: "product",
              id: entityId,
            });
          } else {
            // If we can't determine the type, fall back to assuming it's a product
            const productName = data.productNames[entityId];

            processedSegments.push({
              displayName: productName ? `${productName}` : "Edit Item",
              href: currentPath,
              isPage: isLastSegment,
              isLoading: !productName && isLoading,
              context: "product",
              id: entityId,
            });
          }
        }
      } else if (!["dashboard", "stores"].includes(segment)) {
        // For any other segments that aren't specifically handled
        processedSegments.push({
          displayName: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isPage: isLastSegment,
        });
      }
    }

    setBreadcrumbSegments(processedSegments);
  }, [pathname, user, store, data, isLoading]); // Render a breadcrumb item with proper styling based on context
  const renderBreadcrumbItem = (segment: SegmentInfo) => {
    // Define context-specific styling - but only show in dev tools console, not in UI
    const debugInfo = segment.id ? ` (${segment.context}: ${segment.id})` : "";

    // Log debug info to console when in development mode
    if (process.env.NODE_ENV === "development" && segment.id) {
      console.debug(`Breadcrumb segment: ${segment.displayName}${debugInfo}`);
    }

    if (segment.isLoading) {
      return (
        <div className="flex items-center">
          <Skeleton className="h-5 w-24" />
        </div>
      );
    }

    if (segment.isPage) {
      return <BreadcrumbPage>{segment.displayName}</BreadcrumbPage>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BreadcrumbLink
              href={segment.href}
              className={`transition-colors hover:underline`}
            >
              {segment.displayName}
            </BreadcrumbLink>
          </TooltipTrigger>
          <TooltipContent>
            <p>Navigate to {segment.displayName}</p>
            {process.env.NODE_ENV === "development" && segment.id && (
              <p className="text-xs">ID: {segment.id}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center">
        {breadcrumbSegments.map((segment, index) => (
          <React.Fragment key={`breadcrumb-${segment.href}-${index}`}>
            <BreadcrumbItem>{renderBreadcrumbItem(segment)}</BreadcrumbItem>

            {index < breadcrumbSegments.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
