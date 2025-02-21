"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/validations/auth.schema";
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
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export function SignUpForm() {
  const router = useRouter()
  // Track form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with proper types and validation
  const form = useForm<z.infer<typeof signUpSchema>>({
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
  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    const { name , email, password } = values
    const toastId = toast.loading("Creating account...", {duration: Infinity});
    setIsSubmitting(true);
    await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/verified-email",
    },{
      onError: () => {
        toast.error("An error occurred", { id: toastId , duration: 5000 });
        setIsSubmitting(false);
      },
      onSuccess: () => {
        toast.success(
          "Account created successfully! Please check your email to verify your account.",
          { id: toastId , duration: 5000 }
        );
        setIsSubmitting(false);
        form.reset();
        router.push('/waiting-verification')
      },
    })
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    onChange={(e) => {
                      field.onChange(e);
                      if (form.formState.touchedFields.name) {
                        form.trigger("name");
                      }
                    }}
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
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
