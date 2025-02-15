"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/validations/auth";
import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { signUpAction } from "@/server/actions/auth";
import { useActionState } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Define the form values type based on the schema
type SignUpFormValues = {
  email: string;
  password: string;
  name: string;
};

export function SignUpForm() {
  // Track form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(signUpAction, null);

  // Initialize form with proper types and validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    // Enable validation on change and blur
    mode: "onBlur",
  });

  // Create a wrapper for the form action to handle client-side validation
  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const rawData = Object.fromEntries(formData.entries());
      const validationResult = signUpSchema.safeParse(rawData);

      if (!validationResult.success) {
        // Define the type for our error object
        const errors = validationResult.error.flatten().fieldErrors;

        // Type-safe way to handle the errors
        (Object.keys(errors) as Array<keyof SignUpFormValues>).forEach(
          (key) => {
            const errorMessage = errors[key]?.[0];
            if (errorMessage) {
              form.setError(key, {
                type: "manual",
                message: errorMessage,
              });
            }
          }
        );
        return;
      }

      await formAction(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form action={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className={cn(
                      !!form.formState.errors.name &&
                        "bg-destructive-foreground border-destructive focus:border-none placeholder:text-destructive/70"
                    )}
                    {...field}
                    placeholder="John Doe"
                    // Disable autocomplete to prevent interference
                    autoComplete="off"
                    // Add aria-invalid for accessibility
                    aria-invalid={!!form.formState.errors.name}
                    // Disable during submission
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className={cn(
                      !!form.formState.errors.email &&
                        "bg-destructive-foreground border-destructive focus:border-none placeholder:text-destructive/70"
                    )}
                    {...field}
                    type="email"
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    aria-invalid={!!form.formState.errors.email}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    className={cn(
                      !!form.formState.errors.password &&
                        "bg-destructive-foreground border-destructive focus:border-none placeholder:text-destructive/70"
                    )}
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    aria-invalid={!!form.formState.errors.password}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        {/* Display server-side form errors */}
        {state?.error?._form && (
          <p className="text-sm font-medium text-destructive">
            {state.error._form.join(", ")}
          </p>
        )}

        {/* Display client-side form errors */}
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
