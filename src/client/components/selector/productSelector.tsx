import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Check, X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { getProductsByStore } from "@/app/actions/product.actions";
import { Button } from "@/client/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/client/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { Badge } from "@/client/components/ui/badge";
import { FormLabel, FormDescription } from "@/client/components/ui/form";
import { ScrollArea } from "@/client/components/ui/scroll-area";

// Define types for the product structure
interface Product {
  id: string;
  name: string;
  image_urls?: unknown;
  price: string;
}

interface ProductSelectorProps {
  storeId: string;
  selectedProductIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxHeight?: string;
  label?: string;
  description?: string;
}

const ProductSelector = ({
  storeId,
  selectedProductIds,
  onSelectionChange,
  label = "Select Products",
  description,
}: ProductSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Single source of truth for selected products
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const uniqueSelectedProductIds = useMemo(
    () => [...new Set(selectedProductIds)].sort(),
    [selectedProductIds],
  );
  
  // Fetch products when component mounts
  // Modify this first effect to only depend on storeId
  useEffect(() => {
    const fetchProducts = async () => {
      if (storeId) {
        setIsLoading(true);
        try {
          const result = await getProductsByStore(storeId);
          if (result.success && result.products) {
            setProducts(result.products);
          } else {
            toast.error("Failed to load products");
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [storeId]); // Only depend on storeId for fetching

  // a separate effect to handle selected products initialization
  useEffect(() => {
    if (products.length > 0 && uniqueSelectedProductIds.length > 0) {
      // Get IDs of current selected products
      const currentIds = selectedProducts.map((p) => p.id).sort();
      const targetIds = [...uniqueSelectedProductIds].sort();

      // Only update if the arrays are actually different
      if (JSON.stringify(currentIds) !== JSON.stringify(targetIds)) {
        const initialSelected = products.filter((product) =>
          uniqueSelectedProductIds.includes(product.id),
        );
        setSelectedProducts(initialSelected);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, uniqueSelectedProductIds]);
  // Update parent component whenever our selections change
useEffect(() => {
  const uniqueIds = [...new Set(selectedProducts.map((p) => p.id))].sort();
  const currentIds = [...new Set(selectedProductIds)].sort();

  // Use JSON.stringify for deep equality comparison
  if (JSON.stringify(uniqueIds) !== JSON.stringify(currentIds)) {
    onSelectionChange(uniqueIds);
  }
}, [selectedProducts, onSelectionChange, selectedProductIds]);

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle product selection with duplicate prevention
  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProducts((prev) => {
      // Check if already selected
      const isSelected = prev.some((p) => p.id === product.id);

      if (isSelected) {
        // Only create a new array if we're actually removing something
        return prev.filter((p) => p.id !== product.id);
      } else {
        // Only create a new array if we're actually adding something
        return [...prev, product];
      }
    });
  }, []);

  // Remove a selected product
  const removeSelectedProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Clear search when popover closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  // Get unique selected product IDs for checking selection status
  const selectedProductIdSet = new Set(selectedProducts.map((p) => p.id));

  return (
    <div className="space-y-4">
      {label && <FormLabel>{label}</FormLabel>}

      {/* Product Selector Dropdown */}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {isLoading ? "Loading products..." : "Search and select products"}
            </span>
            <Badge variant="outline" className="ml-2">
              {selectedProducts.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 md:w-[400px]" align="start">
          <Command>
            <CommandInput
              placeholder="Search products..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No products found</CommandEmpty>
              <CommandGroup heading="Products">
                {/* Added a wrapper div with padding-bottom to ensure last items are visible */}
                <div className="pb-2">
                  <ScrollArea>
                    <div className="pb-4">
                      {" "}
                      {/* Added padding at the bottom */}
                      {filteredProducts.map((product) => {
                        const isSelected = selectedProductIdSet.has(product.id);
                        return (
                          <CommandItem
                            key={product.id}
                            onSelect={() => handleProductSelect(product)}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              {Array.isArray(product.image_urls) &&
                              product.image_urls.length > 0 ? (
                                <div className="h-10 w-10 overflow-hidden rounded-md border">
                                  <Image
                                    src={product.image_urls[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    width={40}
                                    height={40}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                                  <span className="text-xs text-muted-foreground">
                                    No img
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {product.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Price: {product.price}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected products */}
      <div className="space-y-2">
        <div className="text-sm font-medium">
          Selected Products ({selectedProducts.length})
        </div>
        {selectedProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products selected</p>
        ) : (
          <div className="flex max-h-[200px] flex-wrap gap-2 overflow-y-auto rounded-md border border-input p-2">
            {/* Ensure we're mapping over unique products */}
            {selectedProducts.map((product) => (
              <Badge
                key={`selected-${product.id}`}
                variant="secondary"
                className="flex items-center gap-1 pl-2"
              >
                {product.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeSelectedProduct(product.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {description && <FormDescription>{description}</FormDescription>}
    </div>
  );
};

export default ProductSelector;
