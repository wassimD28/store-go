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
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { updateCategorySchema } from "@/server/schemas/category.schema";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getCategoryById,
  updateCategory,
} from "@/app/actions/category.actions";
import ImageKitUploader from "../../uploader/imageKitUploader";

interface UpdateCategoryFormProps {
  storeId: string;
  categoryId: string;
}

// Define the form schema for updates
const formSchema = updateCategorySchema;

export default function UpdateCategoryForm({
  storeId,
  categoryId,
}: UpdateCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const { data: authData } = authClient.useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  // Fetch the category data to edit
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (storeId && categoryId) {
        setIsLoadingCategory(true);
        try {
          const result = await getCategoryById(categoryId);
          if (result.success && result.category) {
            // Populate form with existing data
            form.setValue("name", result.category.name);
            form.setValue("description", result.category.description || "");
            form.setValue("imageUrl", result.category.imageUrl || "");

            
          } else {
            toast.error("Failed to load category data");
            router.push(`/stores/${storeId}/products/categories`);
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          toast.error("Failed to load category data");
          router.push(`/stores/${storeId}/products/categories`);
        } finally {
          setIsLoadingCategory(false);
        }
      }
    };

    fetchCategoryData();
  }, [storeId, categoryId, form, router]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Updating category...");

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

      // Update the category
      const response = await updateCategory({
        id: categoryId,
        userId,
        storeId,
        name: values.name,
        description: values.description || null,
        imageUrl: values.imageUrl || null,
      });

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Category updated successfully!");

        // Redirect back to categories page
        if (storeId) {
          router.push(`/stores/${storeId}/products/categories`);
          // Refresh the page to show the updated category
          router.refresh();
        }
      } else {
        toast.error(response.error || "Failed to update category.");
      }
    } catch (error) {
      console.error("Category update error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update category. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if form can be submitted
  const canSubmit = !!storeId && !!authData?.user?.id;

  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center py-10">
        <p>Loading category data...</p>
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
            Update Category
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
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageKitUploader
                      onUploadSuccess={(url) => field.onChange(url)}
                      initialImage={field.value}
                    />
                  </FormControl>
                  <FormDescription>Upload an image (optional)</FormDescription>
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
            {isSubmitting ? "Updating..." : "Update Category"}
          </Button>
        </div>

        {!canSubmit && (
          <p className="text-center text-red-500">
            You must be logged in and have a store selected to update a
            category.
          </p>
        )}
      </form>
    </Form>
  );
}
