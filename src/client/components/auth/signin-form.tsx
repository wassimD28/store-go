"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validations/auth.schema";
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import toast from "react-hot-toast";

export function SignInForm() {
  // Track form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with proper types and validation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    // Enable validation on change and blur
    mode: "onBlur",
  });

  // Create a wrapper for the form action to handle client-side validation
  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const { email, password } = values;
    const toastId = toast.loading("Sign In...");
    setIsSubmitting(true);
    await signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onError: () => {
          toast.error("An error occurred while Sign In", { id: toastId });
          setIsSubmitting(false);
        },
        onSuccess: () => {
          toast.success(
            "You have successfully signed.",
            { id: toastId }
          );
          setIsSubmitting(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                    onChange={(e) => {
                      field.onChange(e);
                      if (form.formState.touchedFields.email) {
                        form.trigger("email");
                      }
                    }}
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
                    onChange={(e) => {
                      field.onChange(e);
                      if (form.formState.touchedFields.password) {
                        form.trigger("password");
                      }
                    }}
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
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? "Sign In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
