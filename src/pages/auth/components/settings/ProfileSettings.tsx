
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AvatarUpload } from '@/components/ui/avatar-upload';

interface ProfileFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  bio: string;
  website: string;
}

const ProfileSettings: React.FC = () => {
  const { user, session } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      email: user?.email || '',
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      phone: profile?.phone || '',
      company: profile?.company || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
    }
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user && profile) {
      form.reset({
        email: user.email || '',
        first_name: user?.user_metadata?.first_name || '',
        last_name: user?.user_metadata?.last_name || '',
        phone: profile?.phone || '',
        company: profile?.company || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
      });
    }
  }, [user, profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log('Updating profile with data:', data);
      
      // Update user metadata first
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        }
      });
      
      if (metadataError) {
        console.error('Metadata update error:', metadataError);
        throw metadataError;
      }

      // Update profile data
      if (profile) {
        await updateProfile({
          phone: data.phone,
          company: data.company,
          bio: data.bio,
          website: data.website,
        });
      }
      
      // Only update email if it actually changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) {
          console.error('Email update error:', emailError);
          // Check for specific error types
          if (emailError.message.includes('invalid')) {
            toast.error('The email address is invalid or not allowed.');
          } else {
            toast.error(`Failed to update email: ${emailError.message}`);
          }
        } else {
          toast.success('Email update initiated. Please check your inbox for confirmation.');
        }
      }
      
      toast.success('Profile updated successfully');
      
      // Force refresh of user data
      const { data: refreshData } = await supabase.auth.getUser();
      if (refreshData?.user) {
        console.log('Updated user data:', refreshData.user);
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      updateProfile({ profile_image: url });
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

      <div className="flex justify-center">
        <AvatarUpload
          currentAvatar={profile?.profile_image || ''}
          onAvatarUpdate={handleAvatarUpdate}
          size="lg"
        />
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="(555) 123-4567" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your company name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://yourwebsite.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Tell us about yourself and your experience..."
                    rows={4}
                  />
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
