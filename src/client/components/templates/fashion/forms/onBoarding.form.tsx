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
import { Textarea } from "@/client/components/ui/textarea";
import { Switch } from "@/client/components/ui/switch";
import toast from "react-hot-toast";
import { useOnBoardingPageStore } from "../stores/onBoarding.store";
import { Radius } from "@/lib/types/interfaces/storeGoElements.interface";
import ImageKitUploader from "@/client/components/uploader/imageKitUploader";

// Update the form schema to match our needs
const formSchema = z.object({
  header: z.string(),
  headerColor: z.string(),
  subtext: z.string().optional(),
  subtextColor: z.string().optional(),
  buttonText: z.string(),
  buttonTextColor: z.string(),
  buttonBackgroundColor: z.string(),
  radius: z.enum(["none", "sm", "md", "lg", "full"]),
  mainImage: z.string().optional(),
  showSignIn: z.boolean().default(true),
  signInText: z.string().optional(),
  signInLinkText: z.string().optional(),
});

// Custom toast component to show JSON data
// Define the interface for toast data
// Define the interface for toast data
interface ToastData {
  header: string;
  headerColor: string;
  subtext?: string;
  subtextColor?: string;
  buttonText: string;
  buttonTextColor: string;
  buttonBackgroundColor: string;
  radius: string;
  mainImage?: string;
}

// Update the CustomToast component with proper typing
const CustomToast = ({ data }: { data: ToastData }) => {
  const jsonString = JSON.stringify(data, null, 2);
  
  return (
    <div className="bg-black text-white p-4 rounded-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Onboarding page updated</h3>
        <button 
          onClick={() => toast.dismiss()} 
          className="text-white hover:text-gray-300"
        >
          ×
        </button>
      </div>
      <div className="text-sm">
        <pre className="whitespace-pre-wrap">{jsonString}</pre>
      </div>
      <div className="mt-2 flex justify-end">
        <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
        <span className="text-xs text-green-400">success</span>
      </div>
    </div>
  );
};
export default function OnBoardingForm() {
  // Access the store
  const { title, button, subtext, signIn, updateTitle, updateButton, updateSubtext, updateSignIn } = useOnBoardingPageStore();

  // Initialize the form with values from the store
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      header: title.text,
      headerColor: title.textColor,
      subtext: subtext?.text || "Fast Delivery, Easy Returns, And Endless Choices Await You",
      subtextColor: subtext?.textColor || "#9CA3AF",
      buttonText: button.text,
      buttonTextColor: button.textColor,
      buttonBackgroundColor: button.backgroundColor,
      radius: button.radius,
      mainImage: "",
      showSignIn: signIn?.show || true,
      signInText: signIn?.text || "Already have account?",
      signInLinkText: signIn?.linkText || "Sign in",
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

      updateSubtext({
        text: values.subtext || "",
        textColor: values.subtextColor || "#9CA3AF",
      });

      updateSignIn({
        show: values.showSignIn,
        text: values.signInText || "Already have account?",
        linkText: values.signInLinkText || "Sign in",
      });

      // Create simplified JSON object similar to image 2
  // Create simplified JSON object with all relevant fields
const jsonData = {
  "header": values.header,
  "headerColor": values.headerColor,
  "subtext": values.subtext || "",
  "subtextColor": values.subtextColor || "#9CA3AF",
  "buttonText": values.buttonText,
  "buttonTextColor": values.buttonTextColor,
  "buttonBackgroundColor": values.buttonBackgroundColor,
  "radius": values.radius,
  "mainImage": values.mainImage || ""
};

      console.log(jsonData);
      
      // Show custom toast with JSON data
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <CustomToast data={jsonData} />
        </div>
      ), { 
        duration: 5000,
        position: 'bottom-right'
      });
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

      if (values.subtext !== undefined || values.subtextColor !== undefined) {
        updateSubtext({
          text: values.subtext || subtext?.text || "",
          textColor: values.subtextColor || subtext?.textColor || "#9CA3AF",
        });
      }

      if (
        values.showSignIn !== undefined ||
        values.signInText !== undefined ||
        values.signInLinkText !== undefined
      ) {
        updateSignIn({
          show: values.showSignIn ?? signIn?.show ?? true,
          text: values.signInText || signIn?.text || "Already have account?",
          linkText: values.signInLinkText || signIn?.linkText || "Sign in",
        });
      }
    });

    // Clean up the subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [form, updateTitle, updateButton, updateSubtext, updateSignIn, title, button, subtext, signIn]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Header Settings</h2>
          
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
          
          {/* Subtext Field */}
          <FormField
            control={form.control}
            name="subtext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtext</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter subtext or tagline" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Subtext Color Field */}
          <FormField
            control={form.control}
            name="subtextColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtext Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" {...field} className="h-10 w-12" />
                    <Input
                      type="text"
                      placeholder="#9CA3AF"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Button Settings</h2>
          
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
                      placeholder="#FFFFFF"
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
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sign In Settings</h2>
          
          {/* Show Sign In Toggle */}
          <FormField
            control={form.control}
            name="showSignIn"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Sign In Text</FormLabel>
                  <FormDescription>
                    Display Already have account? Sign in text
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Sign In Text Field */}
          <FormField
            control={form.control}
            name="signInText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sign In Text</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Already have account?" 
                    {...field} 
                    disabled={!form.watch("showSignIn")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Sign In Link Text Field */}
          <FormField
            control={form.control}
            name="signInLinkText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sign In Link Text</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Sign in" 
                    {...field} 
                    disabled={!form.watch("showSignIn")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Image Settings</h2>
          
          <FormField
            control={form.control}
            name="mainImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Image</FormLabel>
                <FormControl>
                  <ImageKitUploader
                    onUploadSuccess={(url) => field.onChange(url)}
                    initialImage={field.value}
                  />
                </FormControl>
                <FormDescription>Upload an image for your onboarding screen</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
}