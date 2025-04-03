"use client";
import { useState } from "react";
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
import IKimageUploader from "@/client/components/uploader/IKimageUploader";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/client/components/ui/checkbox";

// Define the Zod schema for the form
// You would typically import this from your server/schemas directory
const formSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Price must be a positive number" },
  ),
  categoryId: z.string().uuid("Please select a valid category"),
  subcategoryId: z
    .string()
    .uuid("Please select a valid subcategory")
    .optional(),
  stock_quantity: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    },
    { message: "Stock quantity must be a non-negative number" },
  ),
  imageUrls: z
    .array(z.string())
    .min(1, "At least one product image is required"),
  attributes: z.record(z.string()).optional(),
  featured: z.boolean().default(false),
});

export default function CreateProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);

  // For demo purposes - replace with actual data fetching
  const categories = [
    { id: "123e4567-e89b-12d3-a456-426614174000", name: "Electronics" },
    { id: "223e4567-e89b-12d3-a456-426614174000", name: "Clothing" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      subcategoryId: "",
      stock_quantity: "0",
      imageUrls: [],
      attributes: {},
      featured: false,
    },
  });

  // Handler for category selection - would fetch subcategories
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // In a real application, you would fetch subcategories based on the selected category
    // Example:
    // const fetchSubCategories = async () => {
    //   const res = await fetch(`/api/categories/${categoryId}/subcategories`);
    //   const data = await res.json();
    //   setSubCategories(data);
    // };
    // fetchSubCategories();

    // For demo purposes
    setSubCategories([
      { id: "323e4567-e89b-12d3-a456-426614174000", name: "Smartphones" },
      { id: "423e4567-e89b-12d3-a456-426614174000", name: "Laptops" },
    ]);
  };

  // Handler for successful image upload
  const handleImageUploadSuccess = (url: string) => {
    const newUrls = [...imageUrls, url];
    setImageUrls(newUrls);
    form.setValue("imageUrls", newUrls);
    toast.success("Image uploaded successfully!");
  };

  // Handle attribute changes
  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);

    // Update the form value
    const attributeObject = attributes.reduce(
      (obj, attr) => {
        if (attr.key && attr.value) {
          obj[attr.key] = attr.value;
        }
        return obj;
      },
      {} as Record<string, string>,
    );

    form.setValue("attributes", attributeObject);
  };

  // Add new attribute field
  const addAttributeField = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  // Remove attribute field
  const removeAttributeField = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);

    // Update the form value after removing
    const attributeObject = newAttributes.reduce(
      (obj, attr) => {
        if (attr.key && attr.value) {
          obj[attr.key] = attr.value;
        }
        return obj;
      },
      {} as Record<string, string>,
    );

    form.setValue("attributes", attributeObject);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Creating product...");

      // Format the data for submission
      const productData = {
        ...values,
        price: parseFloat(values.price),
        stock_quantity: parseInt(values.stock_quantity),
      };

      // In a real application, you would submit the data to your API
      // Example:
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData),
      // });
      // if (!response.ok) throw new Error('Failed to create product');

      console.log("Product data to submit:", productData);

      toast.dismiss(loadingToast);
      toast.success("Product created successfully!");
      form.reset();

      // Redirect to product list
      router.push("/products/list");
    } catch (error) {
      console.error("Product creation error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl space-y-8 py-10"
      >
        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Basic Information
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name"
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
                      placeholder="Enter product description"
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            </div>

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>
                      This product will appear on the homepage
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Categorization
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCategoryChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory && (
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategories.map((subCategory) => (
                          <SelectItem
                            key={subCategory.id}
                            value={subCategory.id}
                          >
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Product Attributes
          </CardHeader>
          <CardContent className="space-y-5">
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-end gap-4">
                <FormItem className="flex-1">
                  <FormLabel>Attribute Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Color, Size, Material"
                      value={attr.key}
                      onChange={(e) =>
                        handleAttributeChange(index, "key", e.target.value)
                      }
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex-1">
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Red, Large, Cotton"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                    />
                  </FormControl>
                </FormItem>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeAttributeField(index)}
                  className="h-10 w-10"
                >
                  X
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAttributeField}>
              Add Attribute
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Product Images
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="imageUrls"
              render={() => (
                <FormItem>
                  <FormLabel>Upload Images</FormLabel>
                  <FormControl>
                    <IKimageUploader
                      onUploadSuccess={handleImageUploadSuccess}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload at least one image for your product
                  </FormDescription>
                  <FormMessage />

                  {imageUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-md border"
                        >
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute right-1 top-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => {
                                const newUrls = imageUrls.filter(
                                  (_, i) => i !== index,
                                );
                                setImageUrls(newUrls);
                                form.setValue("imageUrls", newUrls);
                              }}
                            >
                              X
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/products/list")}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
