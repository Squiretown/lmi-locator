
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const formSchema = z.object({
  address: z.string().min(2, {
    message: "Address must be at least 2 characters."
  })
});

interface AddressSearchFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

const AddressSearchForm: React.FC<AddressSearchFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
        <FormField 
          control={form.control} 
          name="address" 
          render={({ field }) => (
            <FormItem className="mx-auto text-center">
              <FormLabel className="text-center block mb-2">Property Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main St, Anytown, CA" 
                  className="text-center max-w-md mx-auto" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-center mt-2">
                Enter the full street address to check LMI eligibility.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="px-6 py-2 flex items-center gap-2"
          >
            <Search size={18} />
            {isLoading ? "Checking..." : "Check LMI Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddressSearchForm;
