import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LoaderIcon, SaveIcon } from 'lucide-react';

// Form schema for eligibility questions
const formSchema = z.object({
  first_time_buyer_label: z.string().min(1, "Label is required"),
  first_time_buyer_description: z.string(),
  military_status_label: z.string().min(1, "Label is required"),
  military_status_description: z.string(),
  residence_intent_label: z.string().min(1, "Label is required"),
  residence_intent_description: z.string(),
  timeframe_label: z.string().min(1, "Label is required"),
  timeframe_description: z.string(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export const EligibilityQuestionsForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_time_buyer_label: "First-Time Homebuyer",
      first_time_buyer_description: "Are you a first-time homebuyer? (Generally defined as not having owned a home in the past 3 years)",
      military_status_label: "Military Status",
      military_status_description: "Please select your current military status.",
      residence_intent_label: "Primary Residence",
      residence_intent_description: "Do you intend to use this property as your primary residence?",
      timeframe_label: "Purchase Timeframe",
      timeframe_description: "When do you plan to purchase a home?",
      is_active: true,
    },
  });

  // Fetch existing questions configuration on component mount
  useEffect(() => {
    const fetchEligibilityQuestions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('key', 'eligibility_questions');

        if (error) throw error;

        if (data && data.length > 0) {
          const questions = JSON.parse(data[0].value);
          form.reset(questions);
        }
      } catch (error) {
        console.error('Error fetching eligibility questions:', error);
        toast.error("Error", {
          description: "Failed to load eligibility questions."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEligibilityQuestions();
  }, [form]);

  // Save the form data to the database
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Check if the settings already exist
      const { data, error: fetchError } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'eligibility_questions');
      
      if (fetchError) throw fetchError;
      
      let saveError;
      
      if (data && data.length > 0) {
        // Update existing settings
        const { error } = await supabase
          .from('system_settings')
          .update({ 
            value: JSON.stringify(values),
            updated_at: new Date().toISOString()
          })
          .eq('key', 'eligibility_questions');
        
        saveError = error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key: 'eligibility_questions',
            value: JSON.stringify(values),
            description: 'Configuration for eligibility screening questions',
            is_public: true
          });
        
        saveError = error;
      }
      
      if (saveError) throw saveError;
      
      toast.success("Success", {
        description: "Eligibility questions have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving eligibility questions:', error);
      toast.error("Error", {
        description: "Failed to save eligibility questions."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Eligibility Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">First-Time Homebuyer Question</h3>
              <FormField
                control={form.control}
                name="first_time_buyer_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The question label shown to users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="first_time_buyer_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Helpful text that explains the question
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Military Status Question</h3>
              <FormField
                control={form.control}
                name="military_status_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="military_status_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Residence Intent Question</h3>
              <FormField
                control={form.control}
                name="residence_intent_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="residence_intent_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Purchase Timeframe Question</h3>
              <FormField
                control={form.control}
                name="timeframe_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeframe_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable the eligibility questions on the frontend
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
            
            <CardFooter className="px-0">
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
