"use client";
import { useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import toast from "react-hot-toast";
import { useOnBoardingPageStore } from "../stores/onBoarding.store";
import { Radius } from "@/lib/types/interfaces/storeGoElements.interface";

// Update the form schema to match our needs
const formSchema = z.object({
  header: z.string(),
  headerColor: z.string(),
  buttonText: z.string(),
  buttonTextColor: z.string(),
  buttonBackgroundColor: z.string(),
  radius: z.enum(["none", "sm", "md", "lg", "full"]),
});

export default function OnBoardingForm() {
  // Access the store
  const { title, button, updateTitle, updateButton } = useOnBoardingPageStore();

  // Initialize the form with values from the store
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      header: title.text,
      headerColor: title.textColor,
      buttonText: button.text,
      buttonTextColor: button.textColor,
      buttonBackgroundColor: button.backgroundColor,
      radius: button.radius,
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Update the store with all form values at once
      updateTitle({
        text: values.header,
        textColor: values.headerColor,
      });

      updateButton({
        text: values.buttonText,
        textColor: values.buttonTextColor,
        backgroundColor: values.buttonBackgroundColor,
        radius: values.radius as Radius,
      });

      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>,
      );

      // You could also show a success toast
      toast.success("Onboarding page updated successfully!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  // Update the store whenever form values change (real-time updates)
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.header !== undefined || values.headerColor !== undefined) {
        updateTitle({
          text: values.header || title.text,
          textColor: values.headerColor || title.textColor,
        });
      }

      if (
        values.buttonText !== undefined ||
        values.buttonTextColor !== undefined ||
        values.buttonBackgroundColor !== undefined ||
        values.radius !== undefined
      ) {
        updateButton({
          text: values.buttonText || button.text,
          textColor: values.buttonTextColor || button.textColor,
          backgroundColor:
            values.buttonBackgroundColor || button.backgroundColor,
          radius: (values.radius as Radius) || button.radius,
        });
      }
    });

    // Clean up the subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [form, updateTitle, updateButton, title, button]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        {/* Header Text Field */}
        <FormField
          control={form.control}
          name="header"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Text</FormLabel>
              <FormControl>
                <Input placeholder="Enter header text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Header Color Field */}
        <FormField
          control={form.control}
          name="headerColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" {...field} className="h-10 w-12" />
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Button Text Field */}
        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text</FormLabel>
              <FormControl>
                <Input placeholder="Enter button text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Button Text Color Field */}
        <FormField
          control={form.control}
          name="buttonTextColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" {...field} className="h-10 w-12" />
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Button Background Color Field */}
        <FormField
          control={form.control}
          name="buttonBackgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Background Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" {...field} className="h-10 w-12" />
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Radius Field */}
        <FormField
          control={form.control}
          name="radius"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Button Radius</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {[
                    ["None", "none"],
                    ["Small", "sm"],
                    ["Medium", "md"],
                    ["Large", "lg"],
                    ["Full", "full"],
                  ].map((option, index) => (
                    <FormItem
                      className="flex items-center space-x-3 space-y-0"
                      key={index}
                    >
                      <FormControl>
                        <RadioGroupItem value={option[1]} />
                      </FormControl>
                      <FormLabel className="font-normal">{option[0]}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>Choose a button corner radius</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
