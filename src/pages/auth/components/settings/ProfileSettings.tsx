
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ProfileFormValues {
  email: string;
  first_name: string;
  last_name: string;
}

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      email: user?.email || '',
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
    }
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        first_name: user?.user_metadata?.first_name || '',
        last_name: user?.user_metadata?.last_name || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) throw emailError;
        
        toast.success('Email update initiated. Please check your inbox for confirmation.');
      }
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        }
      });
      
      if (metadataError) throw metadataError;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal information and how others see you on the platform.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettings;
