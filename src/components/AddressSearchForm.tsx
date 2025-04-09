import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="address" render={({
        field
      }) => <FormItem>
              <FormLabel className="my-[20px] mx-0">Property Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, CA" {...field} />
              </FormControl>
              <FormDescription className="text-center">
                Enter the full street address to check LMI eligibility.
              </FormDescription>
              <FormMessage />
            </FormItem>} />
        <Button type="submit" disabled={isLoading} className="text-center">
          {isLoading ? "Checking..." : "Check LMI Status"}
        </Button>
      </form>
    </Form>;
};
export default AddressSearchForm;