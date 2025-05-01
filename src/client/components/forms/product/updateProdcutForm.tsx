"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import MultiImageUploader from "@/client/components/uploader/MultiImageUploader";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getAppCategories } from "@/app/actions/category.actions";
import { getProductById, updateProduct } from "@/app/actions/product.actions";
import {
  AppCategory,
  AppSubCategory,
} from "@/lib/types/interfaces/schema.interface";
import { getAppSubCategories } from "@/app/actions/subCategory.actions";
import MultiColorSelector, {
  ColorOption,
} from "../../selector/multiColorSelector";
import SizeSelector from "../../selector/sizeSelector";

// Define size options - matching the CreateProductForm
const sizeOptions = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  accessories: ["One Size"],
  custom: [], // Empty array for pure custom sizes
};

// Updated product form schema to match the new schema structure
const productFormSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  subcategoryId: z.string().optional(),
  stock_quantity: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Stock quantity must be a non-negative integer" }),
  image_urls: z.array(z.string()).default([]),
  attributes: z.record(z.string(), z.string()).optional(),
  colors: z.array(z.any()).default([]),
  size: z.array(z.string()).default([]),
  status: z
    .enum(["draft", "published", "out_of_stock", "archived"])
    .default("draft"),
  targetGender: z.enum(["male", "female", "unisex"]).default("unisex"),
});

// Define the component props interface
interface UpdateProductFormProps {
  storeId: string;
  productId: string;
}

export default function UpdateProductForm({
  storeId,
  productId,
}: UpdateProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AppSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { data: authData } = authClient.useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeType, setSizeType] =
    useState<keyof typeof sizeOptions>("clothing");

  // Initialize form with default values
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      subcategoryId: "",
      stock_quantity: 0,
      image_urls: [],
      attributes: {},
      colors: [],
      size: [],
      status: "draft",
      targetGender: "unisex",
    },
  });

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        setIsLoading(true);
        try {
          const result = await getProductById(productId);

          if (result.success && result.product) {
            const product = result.product;

            // Determine the most appropriate size type
            let detectedSizeType: keyof typeof sizeOptions = "clothing";
            if (Array.isArray(product.size) && product.size.length > 0) {
              // Check if sizes match any of our predefined categories
              const sizesAsString = product.size.join(",");
              if (sizeOptions.shoes.some((s) => sizesAsString.includes(s))) {
                detectedSizeType = "shoes";
              } else if (sizesAsString.includes("One Size")) {
                detectedSizeType = "accessories";
              }
              // If no match, it might be custom or clothing (default)
            }

            // Set form values with product data
            form.reset({
              name: product.name,
              description: product.description || "",
              price: parseFloat(product.price),
              categoryId: product.categoryId,
              subcategoryId: product.subcategoryId || "",
              stock_quantity: product.stock_quantity,
              image_urls: Array.isArray(product.image_urls)
                ? product.image_urls
                : [],
              status: product.status as
                | "draft"
                | "published"
                | "out_of_stock"
                | "archived",
              targetGender:
                (product.targetGender as "male" | "female" | "unisex") ||
                "unisex",
              colors: Array.isArray(product.colors) ? product.colors : [],
              size: Array.isArray(product.size) ? product.size : [],
            });

            // Set selected category ID for subcategory filtering
            setSelectedCategoryId(product.categoryId);

            // Set image URLs
            setMultipleImageUrls(
              Array.isArray(product.image_urls) ? product.image_urls : [],
            );

            // Set colors
            if (product.colors) {
              setSelectedColors(
                Array.isArray(product.colors) ? product.colors : [],
              );
            }

            // Set sizes and size type
            if (product.size) {
              setSelectedSizes(Array.isArray(product.size) ? product.size : []);
              setSizeType(detectedSizeType);
            }

            // Process attributes
            if (product.attributes) {
              const productAttributes = product.attributes as Record<
                string,
                string
              >;
              const attrArray: { key: string; value: string }[] = [];

              // Convert attributes to array format for form
              Object.entries(productAttributes).forEach(([key, value]) => {
                attrArray.push({ key, value });
              });

              if (attrArray.length > 0) {
                setAttributes(attrArray);
              } else {
                setAttributes([{ key: "", value: "" }]);
              }
            }
          } else {
            toast.error("Failed to load product data");
            router.push(`/stores/${storeId}/products/list`);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product data");
          router.push(`/stores/${storeId}/products/list`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProductData();
  }, [productId, storeId, form, router]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      if (storeId) {
        setIsLoadingCategories(true);
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
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();
  }, [storeId]);

  // Fetch subcategories when selected category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategoryId) {
        try {
          const result = await getAppSubCategories(storeId);
          if (result.success && result.subcategories) {
            // Filter subcategories to only show those with the selected parent
            const filteredSubcategories = result.subcategories.filter(
              (sub) => sub.parentCategoryId === selectedCategoryId,
            );
            setSubcategories(filteredSubcategories);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategoryId, storeId]);

  // When size type changes, preserve custom sizes
  useEffect(() => {
    // When size type changes, we preserve custom sizes
    // but reset the standard size selections

    // First, identify which sizes are custom (not part of any standard size group)
    const allStandardSizes = Object.values(sizeOptions).flat();
    const customSizesOnly = selectedSizes.filter(
      (size) => !allStandardSizes.includes(size),
    );

    // When changing size type, keep custom sizes but reset standard size selections
    setSelectedSizes([...customSizesOnly]);

    // Update the form value
    form.setValue("size", [...customSizesOnly]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeType]);

  // Handler for multiple images
  const handleMultipleImagesChange = (urls: string[]) => {
    setMultipleImageUrls(urls);
    form.setValue("image_urls", urls);
  };

  // Handle color selection change
  const handleColorsChange = (colors: ColorOption[]) => {
    setSelectedColors(colors);
    form.setValue("colors", colors);
  };

  // Handle size selection change
  const handleSizesChange = (sizes: string[]) => {
    setSelectedSizes(sizes);
    form.setValue("size", sizes);
  };

  // Handle form submission for updating product
  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Updating product...");

      // Verify user and store are available
      const userId = authData?.user?.id;
      if (!userId) {
        toast.dismiss(loadingToast);
        toast.error("No user ID available. Please log in again.");
        return;
      }

      if (!storeId) {
        toast.dismiss(loadingToast);
        toast.error("No store selected. Please select a store first.");
        return;
      }

      // Ensure we have at least one image
      if (values.image_urls.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Please upload at least one product image.");
        return;
      }

      // Collect all product attributes
      const attributesObject: Record<string, string> = {};
      attributes.forEach((attr) => {
        if (attr.key.trim() && attr.value.trim()) {
          attributesObject[attr.key.trim()] = attr.value.trim();
        }
      });

      // Update product with new data
      const response = await updateProduct({
        id: productId,
        userId,
        storeId,
        name: values.name,
        description: values.description || null,
        price: values.price,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId || null,
        stock_quantity: values.stock_quantity,
        image_urls: values.image_urls,
        attributes: attributesObject,
        colors: selectedColors, // Now passing colors directly
        size: selectedSizes, // Now passing sizes directly
        status: values.status,
        targetGender: values.targetGender,
      });

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Product updated successfully!");

        // Redirect to products list
        router.push(`/stores/${storeId}/products/list`);
        router.refresh();
      } else {
        toast.error(response.error || "Failed to update product.");
      }
    } catch (error) {
      console.error("Product update error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if form can be submitted
  const canSubmit = !!storeId && !!authData?.user?.id && !isLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading product data...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl space-y-8 py-10"
      >
        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Edit Product Information
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type product name here"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type a description"
                      className="resize-none h-44"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selector */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the current status of your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Gender Selector - Added to match CreateProductForm */}
            <FormField
              control={form.control}
              name="targetGender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the target gender for this product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategoryId(value);
                    }}
                    value={field.value}
                    disabled={isLoadingCategories || categories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {isLoadingCategories
                            ? "Loading categories..."
                            : "No categories found"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={!selectedCategoryId || subcategories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.length > 0 ? (
                        subcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {!selectedCategoryId
                            ? "Select a category first"
                            : "No subcategories found"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a subcategory for more specific categorization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Product Variants
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Multi-Color Selector */}
            <FormField
              control={form.control}
              name="colors"
              render={() => (
                <FormItem>
                  <FormLabel>Available Colors</FormLabel>
                  <FormControl>
                    <MultiColorSelector
                      value={selectedColors}
                      onChange={handleColorsChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Select the available colors for this product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size type selector */}
            <div className="space-y-2">
              <FormLabel>Size Type</FormLabel>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={sizeType === "clothing" ? "default" : "outline"}
                  onClick={() => setSizeType("clothing")}
                >
                  Clothing
                </Button>
                <Button
                  type="button"
                  variant={sizeType === "shoes" ? "default" : "outline"}
                  onClick={() => setSizeType("shoes")}
                >
                  Shoes
                </Button>
                <Button
                  type="button"
                  variant={sizeType === "accessories" ? "default" : "outline"}
                  onClick={() => setSizeType("accessories")}
                >
                  Accessories
                </Button>
                <Button
                  type="button"
                  variant={sizeType === "custom" ? "default" : "outline"}
                  onClick={() => setSizeType("custom")}
                >
                  Custom
                </Button>
              </div>
            </div>

            {/* Size Selector */}
            <FormField
              control={form.control}
              name="size"
              render={() => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <FormControl>
                    <SizeSelector
                      sizes={sizeOptions[sizeType] || []}
                      selectedSizes={selectedSizes}
                      onChange={handleSizesChange}
                    />
                  </FormControl>
                  <FormDescription>
                    {sizeType === "custom"
                      ? "Add your own custom sizes for this product"
                      : "Select the available sizes for this product or add custom ones"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Product Attributes
            <FormDescription className="font-normal">
              Add additional attributes such as material, weight, etc.
            </FormDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-end gap-2">
                <FormItem className="flex-1">
                  <FormLabel>{index === 0 ? "Attribute Name" : ""}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Material"
                      value={attr.key}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].key = e.target.value;
                        setAttributes(newAttrs);
                      }}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex-1">
                  <FormLabel>{index === 0 ? "Value" : ""}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Cotton"
                      value={attr.value}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].value = e.target.value;
                        setAttributes(newAttrs);
                      }}
                    />
                  </FormControl>
                </FormItem>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newAttrs = [...attributes];
                    newAttrs.splice(index, 1);
                    setAttributes(newAttrs);
                  }}
                  disabled={attributes.length === 1 && index === 0}
                >
                  <i className="h-4 w-4">✕</i>
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAttributes([...attributes, { key: "", value: "" }]);
              }}
            >
              Add Attribute
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">Media</CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="image_urls"
              render={() => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <MultiImageUploader
                      onImagesChange={handleMultipleImagesChange}
                      maxImages={5}
                      initialImages={multipleImageUrls}
                    />
                  </FormControl>
                  <FormDescription className="mt-2">
                    Upload up to 5 images. First image will be used as the
                    featured image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="lg" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
        {!canSubmit && !isLoading && (
          <p className="text-center text-red-500">
            You must be logged in and have a store selected to update a product.
          </p>
        )}
      </form>
    </Form>
  );
}
