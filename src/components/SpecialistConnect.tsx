
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2Icon } from 'lucide-react';

// Form schema validation with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  message: z.string().optional(),
});

interface SpecialistConnectProps {
  address: string;
  propertyId?: string;
  onComplete: () => void;
}

const SpecialistConnect: React.FC<SpecialistConnectProps> = ({ 
  address,
  propertyId,
  onComplete
}) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'm interested in learning more about down payment assistance programs for ${address}.`,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create a new lead in the database
      const { error } = await supabase
        .from('professional_leads')
        .insert({
          professional_id: null, // Will be assigned to an available professional
          client_name: data.name,
          email: data.email,
          phone: data.phone,
          property_address: address,
          property_id: propertyId,
          status: 'new',
          source: 'connect_specialist_form',
          notes: data.message
        });
        
      if (error) throw error;
      
      setIsSubmitted(true);
      
      toast({
        title: "Request Sent",
        description: "A specialist will contact you shortly about down payment assistance options.",
      });
      
      // Wait a bit before completing to let the user see the success message
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error submitting specialist request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto mt-8 text-center"
      >
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 px-8 flex flex-col items-center">
            <CheckCircle2Icon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Received!</h3>
            <p className="text-muted-foreground">
              A down payment assistance specialist will contact you shortly at {form.getValues().email}.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Connect with a Specialist</CardTitle>
          <CardDescription>
            Get personalized help with down payment assistance programs for {address}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="you@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 555-5555" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what you're looking for help with..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any specific questions you have about down payment assistance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-end px-0 pt-2">
                <Button type="submit">Submit Request</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpecialistConnect;
