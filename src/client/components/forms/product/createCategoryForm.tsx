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
import IKimageUploader from "@/client/components/uploader/IKimageUploader";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { createCategorySchema } from "@/server/schemas/category.schema";
import { useRouter } from "next/navigation";
import { AppCategory } from "@/lib/types/interfaces/schema.interface";
import { authClient } from "@/lib/auth-client";
import {
  createCategory,
  getAppCategories,
} from "@/app/actions/category.actions";
import { createSubCategory } from "@/app/actions/subCategory.actions";

interface CreateCategoryFormProps {
  storeId: string;
}
// Define the Zod schema for the form
const formSchema = createCategorySchema;

export default function CreateCategoryForm({storeId}: CreateCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<AppCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { data: authData } = authClient.useSession();

  useEffect(() => {
    const fetchCategories = async () => {
      if (storeId) {
        setIsLoadingCategories(true);
        try {
          const result = await getAppCategories(storeId);
          if (result.success && result.categories) {
            setParentCategories(result.categories);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parentCategory: "",
      imageUrl: "",
    },
  });

  // Handler for successful image upload
  const handleImageUploadSuccess = (url: string) => {
    form.setValue("imageUrl", url);
    setImageUrl(url);
    toast.success("Image uploaded successfully!");
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Creating category...");

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

      let response;
      let categoryType = "category";

      // Create subcategory if parent category is selected
      if (values.parentCategory) {
        categoryType = "subcategory";
        response = await createSubCategory({
          userId,
          storeId: storeId,
          name: values.name,
          description: values.description || null,
          imageUrl: values.imageUrl || null,
          parentCategoryId: values.parentCategory,
        });
      } else {
        // Create a regular category
        response = await createCategory({
          userId,
          storeId: storeId,
          name: values.name,
          description: values.description || null,
          imageUrl: values.imageUrl || null,
        });
      }

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success(
          `${categoryType === "category" ? "Category" : "Subcategory"} created successfully!`,
        );
        form.reset();

        // Redirect based on category type
        if (storeId) {
          // Update with your actual route structure
          router.push(`/stores/${storeId}/products/categories`);
          // Refresh the page to show the new category
          router.refresh();
        }
      } else {
        toast.error(response.error || `Failed to create ${categoryType}.`);
      }
    } catch (error) {
      console.error("Category creation error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create category. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if form can be submitted
  const canSubmit = !!storeId && !!authData?.user?.id;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl space-y-8 py-10"
      >
        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            General Information
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type name here"
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
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent category (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      isLoadingCategories || parentCategories.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.length > 0 ? (
                        parentCategories.map((category) => (
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
                  {!field.value && (
                    <FormDescription>
                      If no parent is selected, a top-level category will be
                      created
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">Media</CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="imageUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Category Image (optional)</FormLabel>
                  <FormControl>
                    <IKimageUploader
                      onUploadSuccess={handleImageUploadSuccess}
                    />
                  </FormControl>
                  <FormDescription>
                    {imageUrl
                      ? "Image uploaded successfully"
                      : "Upload an image for the category (optional)"}
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
            {isSubmitting ? "Creating..." : "Create Category"}
          </Button>
        </div>

        {!canSubmit && (
          <p className="text-center text-red-500">
            You must be logged in and have a store selected to create a
            category.
          </p>
        )}
      </form>
    </Form>
  );
}
