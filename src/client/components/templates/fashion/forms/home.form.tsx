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
import { useHomePageStore, Radius } from "../stores/home.store";

// Define the interface for home toast data
interface HomeToastData {
    searchPlaceholder: string;
    searchBarColor: string;
    searchBarRadius: Radius;
  }
  
  // Create a CustomToast component for home form
  const CustomToast = ({ data }: { data: HomeToastData }) => {
    const jsonString = JSON.stringify(data, null, 2);
    
    return (
      <div className="bg-indigo-600 text-white p-4 rounded-lg max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Home page updated</h3>
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
          <div className="h-2 w-2 rounded-full bg-green-400 mr-1"></div>
          <span className="text-xs text-green-300">success</span>
        </div>
      </div>
    );
  };
  
  // Update the form schema for home page
  const formSchema = z.object({
    searchPlaceholder: z.string(),
    searchBarColor: z.string(),
    searchBarRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  });
  
  export default function DarkHomeForm() {
    // Access the store
    const { searchBar, updateSearchBar } = useHomePageStore();
  
    // Initialize the form with values from the store
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        searchPlaceholder: searchBar.placeholder,
        searchBarColor: searchBar.backgroundColor,
        searchBarRadius: searchBar.radius,
      },
    });
  
    // Handle form submission
    function onSubmit(values: z.infer<typeof formSchema>) {
      try {
        // Update the store with form values
        updateSearchBar({
          placeholder: values.searchPlaceholder,
          backgroundColor: values.searchBarColor,
          radius: values.searchBarRadius as Radius,
        });
  
        // Create JSON data object for the toast
        const jsonData = {
          searchPlaceholder: values.searchPlaceholder,
          searchBarColor: values.searchBarColor,
          searchBarRadius: values.searchBarRadius,
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
        if (
          values.searchPlaceholder !== undefined ||
          values.searchBarColor !== undefined ||
          values.searchBarRadius !== undefined
        ) {
          updateSearchBar({
            placeholder: values.searchPlaceholder || searchBar.placeholder,
            backgroundColor: values.searchBarColor || searchBar.backgroundColor,
            radius: (values.searchBarRadius as Radius) || searchBar.radius,
          });
        }
      });
  
      // Clean up the subscription when component unmounts
      return () => subscription.unsubscribe();
    }, [form, updateSearchBar, searchBar]);
  
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl space-y-8 py-10 px-4 bg-black text-white"
        >
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white"></h2>
            
            {/* Search Placeholder Field */}
            <FormField
              control={form.control}
              name="searchPlaceholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Search Placeholder</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter search placeholder text" 
                      {...field} 
                      className="bg-black border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
  
            {/* Search Bar Color Field */}
            <FormField
              control={form.control}
              name="searchBarColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Search Bar Background Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-10 w-12 p-1 bg-transparent border-gray-700"
                      />
                      <Input
                        type="text"
                        placeholder="#F5F5F5"
                        value={field.value}
                        onChange={field.onChange}
                        className="bg-black border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
  
            {/* Search Bar Radius Field */}
            <FormField
              control={form.control}
              name="searchBarRadius"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white">Search Bar Radius</FormLabel>
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
                            <RadioGroupItem 
                              value={option[1]} 
                              id={`radius-${option[1]}`}
                              className="border-gray-600 text-indigo-500 focus:ring-indigo-500"
                            />
                          </FormControl>
                          <FormLabel 
                            htmlFor={`radius-${option[1]}`}
                            className="font-normal text-white cursor-pointer"
                          >
                            {option[0]}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="text-gray-400">Choose a search bar corner radius</FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
  
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md transition duration-200"
          >
            Save Changes
          </Button>
        </form>
      </Form>
    );
  }