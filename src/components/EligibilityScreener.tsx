
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EligibilityScreenerFormData } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Form schema validation with zod
const formSchema = z.object({
  first_time_buyer: z.boolean().default(false),
  military_status: z.enum(['none', 'veteran', 'active', 'reserve']).default('none'),
  residence_intent: z.boolean().default(true),
  timeframe: z.enum(['0-3', '3-6', '6-12', '12+']).default('3-6'),
});

interface EligibilityScreenerProps {
  propertyId?: string;
  searchId?: string;
  address: string;
  onComplete: (result: any) => void;
}

const EligibilityScreener: React.FC<EligibilityScreenerProps> = ({ 
  propertyId, 
  searchId, 
  address,
  onComplete 
}) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_time_buyer: false,
      military_status: 'none',
      residence_intent: true,
      timeframe: '3-6',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Save eligibility check to database
      const { data: eligibilityCheck, error } = await supabase
        .from('program_eligibility_checks')
        .insert({
          user_id: userId,
          search_id: searchId,
          property_id: propertyId,
          first_time_buyer: data.first_time_buyer,
          military_status: data.military_status,
          residence_intent: data.residence_intent,
          timeframe: data.timeframe,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Find matching programs
      const { data: matchingPrograms, error: programsError } = await supabase
        .from('assistance_programs')
        .select(`
          *,
          program_locations(*),
          property_types_eligible(*)
        `)
        .eq('status', 'active')
        .lte('min_credit_score', 680) // Default value, would normally come from user profile
        .or(`first_time_buyer_required.eq.${data.first_time_buyer},first_time_buyer_required.eq.false`);
      
      if (programsError) throw programsError;
      
      // Update the eligibility check with matching programs
      if (eligibilityCheck?.id) {
        await supabase
          .from('program_eligibility_checks')
          .update({
            eligible_programs: matchingPrograms
          })
          .eq('id', eligibilityCheck.id);
      }
      
      // Call the onComplete callback with results
      onComplete({
        eligibilityCheck,
        matchingPrograms
      });
      
      toast({
        title: "Eligibility Check Complete",
        description: `Found ${matchingPrograms?.length || 0} potential assistance programs for you.`,
      });
    } catch (error) {
      console.error('Error during eligibility check:', error);
      toast({
        title: "Error",
        description: "Failed to complete eligibility check. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Down Payment Assistance Eligibility</CardTitle>
          <CardDescription>
            Answer a few quick questions to see which assistance programs you might qualify for at {address}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="first_time_buyer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>First-Time Homebuyer</FormLabel>
                      <FormDescription>
                        Are you a first-time homebuyer? (Generally defined as not having owned a home in the past 3 years)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="military_status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Military Status</FormLabel>
                    <FormDescription>
                      Please select your current military status.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">None</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="veteran" />
                          </FormControl>
                          <FormLabel className="font-normal">Veteran</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="active" />
                          </FormControl>
                          <FormLabel className="font-normal">Active Duty</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="reserve" />
                          </FormControl>
                          <FormLabel className="font-normal">Reserve/National Guard</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="residence_intent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Primary Residence</FormLabel>
                      <FormDescription>
                        Do you intend to use this property as your primary residence?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Purchase Timeframe</FormLabel>
                    <FormDescription>
                      When do you plan to purchase a home?
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="0-3" />
                          </FormControl>
                          <FormLabel className="font-normal">0-3 months</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="3-6" />
                          </FormControl>
                          <FormLabel className="font-normal">3-6 months</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="6-12" />
                          </FormControl>
                          <FormLabel className="font-normal">6-12 months</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="12+" />
                          </FormControl>
                          <FormLabel className="font-normal">12+ months</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-end px-0 pt-4">
                <Button type="submit">Find Assistance Programs</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EligibilityScreener;
