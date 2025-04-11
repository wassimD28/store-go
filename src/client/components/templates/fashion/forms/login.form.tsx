
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useLoginPageStore } from "../stores/login.store";


// Form schema
const formSchema = z.object({
  inputPlaceholder: z.string(),
});

export default function LoginForm() {
  // Access the store
  const { inputPlaceholder, updateInputPlaceholder } = useLoginPageStore();

  // Initialize the form with values from the store
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputPlaceholder: inputPlaceholder,
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Update the store
      updateInputPlaceholder(values.inputPlaceholder);

      toast.success("Login page updated successfully!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  // Update the store whenever form values change (real-time updates)
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.inputPlaceholder !== undefined) {
        updateInputPlaceholder(values.inputPlaceholder);
      }
    });

    // Clean up the subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [form, updateInputPlaceholder]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        {/* Input Placeholder Field */}
        <FormField
          control={form.control}
          name="inputPlaceholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Placeholder</FormLabel>
              <FormControl>
                <Input placeholder="Enter input placeholder text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
