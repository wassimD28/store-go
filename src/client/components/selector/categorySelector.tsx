
import { useState, useEffect, useCallback } from "react";
import { Check, X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAppCategories } from "@/app/actions/category.actions";
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
import Image from "next/image";

// Define types for the category structure
interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

interface CategorySelectorProps {
  storeId: string;
  selectedCategoryIds: string[];
  onSelectionChange: (ids: string[]) => void;
  label?: string;
  description?: string;
}

const CategorySelector = ({
  storeId,
  selectedCategoryIds,
  onSelectionChange,
  label = "Select Categories",
  description,
}: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Single source of truth for selected categories
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      if (storeId) {
        setIsLoading(true);
        try {
          const result = await getAppCategories(storeId);
          if (result.success && result.categories) {
            setCategories(result.categories);
          } else {
            toast.error("Failed to load categories");
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Failed to load categories");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();
  }, [storeId]);
  // a separate effect to handle selected categories initialization
  useEffect(() => {
    // Only run this effect when we have both categories and selectedCategoryIds
    if (categories.length > 0 && selectedCategoryIds.length > 0) {
      // Get current selected IDs for comparison
      const currentIds = selectedCategories.map((c) => c.id).sort();
      const targetIds = [...selectedCategoryIds].sort();

      // Only update if the arrays are actually different
      if (JSON.stringify(currentIds) !== JSON.stringify(targetIds)) {
        const initialSelected = categories.filter((category) =>
          selectedCategoryIds.includes(category.id),
        );
        setSelectedCategories(initialSelected);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedCategoryIds]);
  // Update parent component whenever our selections change
  //  effect that notifies parent only when necessary
  useEffect(() => {
    const uniqueIds = [...new Set(selectedCategories.map((c) => c.id))].sort();
    const currentIds = [...new Set(selectedCategoryIds)].sort();

    // Use deep equality comparison
    if (JSON.stringify(uniqueIds) !== JSON.stringify(currentIds)) {
      onSelectionChange(uniqueIds);
    }
  }, [selectedCategories, onSelectionChange, selectedCategoryIds]);

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle category selection with duplicate prevention
  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((c) => c.id === category.id);

      if (isSelected) {
        // Remove category
        return prev.filter((c) => c.id !== category.id);
      } else {
        // Add category (ensure no duplicates)
        return [...prev, category];
      }
    });
  }, []);

  // Remove a selected category
  const removeSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  // Clear search when popover closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  // Get unique selected category IDs for checking selection status
  const selectedCategoryIdSet = new Set(selectedCategories.map((c) => c.id));

  return (
    <div className="space-y-4">
      {label && <FormLabel>{label}</FormLabel>}

      {/* Category Selector Dropdown */}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {isLoading
                ? "Loading categories..."
                : "Search and select categories"}
            </span>
            <Badge variant="outline" className="ml-2">
              {selectedCategories.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 md:w-[400px]" align="start">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No categories found</CommandEmpty>
              <CommandGroup heading="Categories">
                <div className="pb-2">
                  <ScrollArea>
                    <div className="pb-4">
                      {filteredCategories.map((category) => {
                        const isSelected = selectedCategoryIdSet.has(
                          category.id,
                        );
                        return (
                          <CommandItem
                            key={category.id}
                            onSelect={() => handleCategorySelect(category)}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              {category.imageUrl ? (
                                <div className="h-10 w-10 overflow-hidden rounded-md border">
                                  <Image
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                    height={100}
                                    width={100}
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
                                  {category.name}
                                </span>
                                {category.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {category.description.length > 30
                                      ? `${category.description.substring(0, 30)}...`
                                      : category.description}
                                  </span>
                                )}
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

      {/* Display selected categories */}
      <div className="space-y-2">
        <div className="text-sm font-medium">
          Selected Categories ({selectedCategories.length})
        </div>
        {selectedCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories selected
          </p>
        ) : (
          <div className="flex max-h-[200px] flex-wrap gap-2 overflow-y-auto rounded-md border border-input p-2">
            {selectedCategories.map((category) => (
              <Badge
                key={`selected-${category.id}`}
                variant="secondary"
                className="flex items-center gap-1 pl-2"
              >
                {category.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeSelectedCategory(category.id)}
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

export default CategorySelector;
