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
import { createCategorySchema } from "@/server/schemas/category.schema";
import { CategoryActions } from "@/server/actions/category.actions";
import { useRouter } from "next/navigation";
//import { authClient } from "@/lib/auth-client";

// Define the Zod schema for the form
const formSchema = createCategorySchema;

export default function CreateCategoryForm() {
  const router = useRouter(); // Initialize router for navigation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  //const { data } = authClient.useSession();
  //const userId = data?.session.userId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parentCategory: "",
      imageUrl: "",
      isMainCategory: false,
    },
  });

  // Handler for successful image upload
  const handleImageUploadSuccess = (url: string) => {
    // Update form value and local state
    form.setValue("imageUrl", url);
    setImageUrl(url);
    toast.success("Image uploaded successfully!");
  };
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof createCategorySchema>) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      // Start submission process
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading("Creating category...");

      

      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Category created successfully!");

      // Reset form after successful submission
      form.reset();

      // Optional: Redirect to category list or details page
      router.push("/categories"); // Adjust route as needed
    } catch (error) {
      // Handle any errors during submission
      console.error("Category creation error", error);

      // Show error toast
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create category. Please try again.",
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
                  <FormLabel>Parent category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="m@example.com">
                        m@example.com
                      </SelectItem>
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">
                        m@support.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <IKimageUploader
                      onUploadSuccess={handleImageUploadSuccess}
                    />
                  </FormControl>
                  <FormDescription>
                    {imageUrl
                      ? "Image uploaded successfully"
                      : "Upload an image for the category"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Button size={"lg"} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
