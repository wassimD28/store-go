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
import { Card, CardContent, CardHeader } from "@/client/components/ui/card";
import { useRouter } from "next/navigation";
import IKimageUploader from "@/client/components/uploader/IKimageUploader";
import { createStore } from "@/app/actions/store.actions";
import { authClient } from "@/lib/auth-client";
import { getStoreCategories } from "@/app/actions/storeCategory.actions";
import {  StoreCategoryPayload } from "@/lib/types/interfaces/schema.interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

// Define Zod schema for store creation
const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Store name must be at least 2 characters" }),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  appUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  categoryId: z.string({
    required_error: "Please select a store category",
  }),
});

export default function CreateStoreForm() {
  const router = useRouter();
  const { data: authData } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  // Add state for categories
  const [categories, setCategories] = useState<StoreCategoryPayload []>(
    [],
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (authData?.user?.id) {
        setIsLoadingCategories(true);
        try {
          const result = await getStoreCategories();
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
  }, [authData?.user?.id]);

  const form = useForm<z.infer<typeof createStoreSchema>>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      appUrl: "",
      categoryId: "",
    },
  });

  // Handler for successful logo upload
  const handleLogoUploadSuccess = (url: string) => {
    // Update form value and local state
    form.setValue("logoUrl", url);
    setLogoUrl(url);
    toast.success("Logo uploaded successfully!");
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof createStoreSchema>) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      // Start submission process
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading("Creating store...");
      // get user id
      const userId = authData?.user?.id;
      // if user id not found
      if (!userId) {
        throw new Error("No provided user ID to create store");
      }

      // Upload logo if provided
      if (logoUrl) {
        values.logoUrl = logoUrl;
      }

      // Make sure categoryId is passed correctly
      const response = await createStore({
        userId,
        name: values.name,
        logoUrl: values.logoUrl,
        appUrl: values.appUrl,
        categoryId: values.categoryId, 
      });

      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success("Store created successfully!");
        form.reset();
        router.push("/stores");
      } else {
        // Handle the specific error returned from the server action
        toast.error(
          response.error || "Failed to create store. Please try again.",
        );
      }
    } catch (error) {
      // Handle any errors during submission
      console.error("Store creation error", error);

      // Show error toast
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create store. Please try again.",
      );
    } finally {
      // Always reset submission state
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 p-10"
      >
        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">
            Store Information
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter store name"
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
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your store"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCategories}
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
                  {categories.length === 0 && !isLoadingCategories && (
                    <FormDescription className="text-yellow-600">
                      You need to create a category first before creating a
                      store.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-store-website.com"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add your store&apos;s website URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-custom-2xl">
          <CardHeader className="text-xl font-semibold">Store Logo</CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="logoUrl"
              render={() => (
                <FormItem>
                  <FormControl>
                    <IKimageUploader
                      onUploadSuccess={handleLogoUploadSuccess}
                    />
                  </FormControl>
                  <FormDescription>
                    {logoUrl
                      ? "Logo uploaded successfully"
                      : "Upload a logo for your store"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Button size={"lg"} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Store..." : "Create Store"}
        </Button>
      </form>
    </Form>
  );
}
