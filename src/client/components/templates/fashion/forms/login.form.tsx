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
import { Switch } from "@/client/components/ui/switch";
import toast from "react-hot-toast";
import { useLoginPageStore } from "../stores/login.store";
import { Radius } from "@/lib/types/interfaces/storeGoElements.interface";

// Define the interface for login toast data
interface LoginToastData {
  headerText: string;
  headerColor: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  inputTextColor: string;
  inputBackgroundColor: string;
  inputRadius: string;
  buttonText: string;
  buttonTextColor: string;
  buttonBackgroundColor: string;
  buttonRadius: string;
  showForgotPassword: boolean;
  forgotPasswordText?: string;
  showCreateAccount: boolean;
  createAccountText?: string;
}

// Create a CustomToast component for login form
const CustomToast = ({ data }: { data: LoginToastData }) => {
  const jsonString = JSON.stringify(data, null, 2);
  
  return (
    <div className="bg-black text-white p-4 rounded-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Login page updated</h3>
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

// Update the form schema to match our needs
const formSchema = z.object({
  headerText: z.string(),
  headerColor: z.string(),
  emailPlaceholder: z.string(),
  passwordPlaceholder: z.string(),
  inputTextColor: z.string(),
  inputBackgroundColor: z.string(),
  inputRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  buttonText: z.string(),
  buttonTextColor: z.string(),
  buttonBackgroundColor: z.string(),
  buttonRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  showForgotPassword: z.boolean().default(true),
  forgotPasswordText: z.string().optional(),
  showCreateAccount: z.boolean().default(true),
  createAccountText: z.string().optional(),
});

export default function LoginForm() {
  // Access the store
  const { 
    header, 
    inputField, 
    button, 
    forgotPassword,
    createAccount, 
    updateHeader, 
    updateInputField, 
    updateButton, 
    updateForgotPassword,
    updateCreateAccount 
  } = useLoginPageStore();

  // Initialize the form with values from the store
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headerText: header.text,
      headerColor: header.textColor,
      emailPlaceholder: inputField.emailPlaceholder,
      passwordPlaceholder: inputField.passwordPlaceholder,
      inputTextColor: inputField.textColor,
      inputBackgroundColor: inputField.backgroundColor,
      inputRadius: inputField.radius,
      buttonText: button.text,
      buttonTextColor: button.textColor,
      buttonBackgroundColor: button.backgroundColor,
      buttonRadius: button.radius,
      showForgotPassword: forgotPassword.show,
      forgotPasswordText: forgotPassword.text,
      showCreateAccount: createAccount.show,
      createAccountText: createAccount.text,
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Update the store with all form values at once
      updateHeader({
        text: values.headerText,
        textColor: values.headerColor,
      });

      updateInputField({
        emailPlaceholder: values.emailPlaceholder,
        passwordPlaceholder: values.passwordPlaceholder,
        textColor: values.inputTextColor,
        backgroundColor: values.inputBackgroundColor,
        radius: values.inputRadius as Radius,
        placeholderTextColor: inputField.placeholderTextColor,
      });

      updateButton({
        text: values.buttonText,
        textColor: values.buttonTextColor,
        backgroundColor: values.buttonBackgroundColor,
        radius: values.buttonRadius as Radius,
      });

      updateForgotPassword({
        show: values.showForgotPassword,
        text: values.forgotPasswordText || "Forgot Password?",
      });

      updateCreateAccount({
        show: values.showCreateAccount,
        text: values.createAccountText || "Don't have an Account? Create One",
      });

      // Create JSON data object for the toast
      const jsonData = {
        "headerText": values.headerText,
        "headerColor": values.headerColor,
        "emailPlaceholder": values.emailPlaceholder,
        "passwordPlaceholder": values.passwordPlaceholder,
        "inputTextColor": values.inputTextColor,
        "inputBackgroundColor": values.inputBackgroundColor,
        "inputRadius": values.inputRadius,
        "buttonText": values.buttonText,
        "buttonTextColor": values.buttonTextColor,
        "buttonBackgroundColor": values.buttonBackgroundColor,
        "buttonRadius": values.buttonRadius,
        "showForgotPassword": values.showForgotPassword,
        "forgotPasswordText": values.forgotPasswordText || "Forgot Password?",
        "showCreateAccount": values.showCreateAccount,
        "createAccountText": values.createAccountText || "Don't have an Account? Create One"
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
      if (values.headerText !== undefined || values.headerColor !== undefined) {
        updateHeader({
          text: values.headerText || header.text,
          textColor: values.headerColor || header.textColor,
        });
      }

      if (
        values.emailPlaceholder !== undefined ||
        values.passwordPlaceholder !== undefined ||
        values.inputTextColor !== undefined ||
        values.inputBackgroundColor !== undefined ||
        values.inputRadius !== undefined
      ) {
        updateInputField({
          emailPlaceholder: values.emailPlaceholder || inputField.emailPlaceholder,
          passwordPlaceholder: values.passwordPlaceholder || inputField.passwordPlaceholder,
          textColor: values.inputTextColor || inputField.textColor,
          backgroundColor: values.inputBackgroundColor || inputField.backgroundColor,
          radius: (values.inputRadius as Radius) || inputField.radius,
          placeholderTextColor: inputField.placeholderTextColor,
        });
      }

      if (
        values.buttonText !== undefined ||
        values.buttonTextColor !== undefined ||
        values.buttonBackgroundColor !== undefined ||
        values.buttonRadius !== undefined
      ) {
        updateButton({
          text: values.buttonText || button.text,
          textColor: values.buttonTextColor || button.textColor,
          backgroundColor: values.buttonBackgroundColor || button.backgroundColor,
          radius: (values.buttonRadius as Radius) || button.radius,
        });
      }

      if (
        values.showForgotPassword !== undefined ||
        values.forgotPasswordText !== undefined
      ) {
        updateForgotPassword({
          show: values.showForgotPassword ?? forgotPassword.show,
          text: values.forgotPasswordText || forgotPassword.text,
        });
      }

      if (
        values.showCreateAccount !== undefined ||
        values.createAccountText !== undefined
      ) {
        updateCreateAccount({
          show: values.showCreateAccount ?? createAccount.show,
          text: values.createAccountText || createAccount.text,
        });
      }
    });

    // Clean up the subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [form, updateHeader, updateInputField, updateButton, updateForgotPassword, updateCreateAccount, header, inputField, button, forgotPassword, createAccount]);

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
            name="headerText"
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
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Input Field Settings</h2>
          
          {/* Email Input Placeholder Field */}
          <FormField
            control={form.control}
            name="emailPlaceholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Input Placeholder</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email placeholder text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Input Placeholder Field */}
          <FormField
            control={form.control}
            name="passwordPlaceholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Input Placeholder</FormLabel>
                <FormControl>
                  <Input placeholder="Enter password placeholder text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Input Text Color Field */}
          <FormField
            control={form.control}
            name="inputTextColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Text Color</FormLabel>
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

          {/* Input Background Color Field */}
          <FormField
            control={form.control}
            name="inputBackgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Background Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" {...field} className="h-10 w-12" />
                    <Input
                      type="text"
                      placeholder="#1A1A1A"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Input Radius Field */}
          <FormField
            control={form.control}
            name="inputRadius"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Input Radius</FormLabel>
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
                <FormDescription>Choose an input corner radius</FormDescription>
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

          {/* Button Radius Field */}
          <FormField
            control={form.control}
            name="buttonRadius"
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
          <h2 className="text-xl font-semibold">Forgot Password Settings</h2>
          
          {/* Show Forgot Password Toggle */}
          <FormField
            control={form.control}
            name="showForgotPassword"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Forgot Password</FormLabel>
                  <FormDescription>
                    Display Forgot Password? link
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
          
          {/* Forgot Password Text Field */}
          <FormField
            control={form.control}
            name="forgotPasswordText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forgot Password Text</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Forgot Password?" 
                    {...field} 
                    disabled={!form.watch("showForgotPassword")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Account Settings</h2>
          
          {/* Show Create Account Toggle */}
          <FormField
            control={form.control}
            name="showCreateAccount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Create Account</FormLabel>
                  <FormDescription>
                    Display Dont have an account? section
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
          
          {/* Create Account Text Field */}
          <FormField
            control={form.control}
            name="createAccountText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Create Account Text</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Don't have an Account? Create One" 
                    {...field} 
                    disabled={!form.watch("showCreateAccount")}
                  />
                </FormControl>
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