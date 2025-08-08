
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
import { syncProfessionalProfile, getProfessionalProfile } from '@/lib/utils/professionalSync';
import { Separator } from '@/components/ui/separator';

interface ProfileFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  bio: string;
  website: string;
  license_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  professional_bio: string;
  company_address: string;
  company_website: string;
  job_title: string;
}

const ProfileSettings: React.FC = () => {
  const { user, session } = useAuth();
  const { profile, updateProfile, refetch } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [professionalProfile, setProfessionalProfile] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      email: user?.email || '',
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      phone: profile?.phone || '',
      company: profile?.company || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      license_number: profile?.license_number || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zip_code: profile?.zip_code || '',
      professional_bio: professionalProfile?.bio || '',
      company_address: '',
      company_website: '',
      job_title: '',
    }
  });

  // Fetch professional profile data
  useEffect(() => {
    if (user && (user.user_metadata?.user_type === 'realtor' || user.user_metadata?.user_type === 'mortgage_professional')) {
      getProfessionalProfile(user.id).then(setProfessionalProfile);
    }
  }, [user]);

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
        license_number: profile?.license_number || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        professional_bio: professionalProfile?.bio || '',
        company_address: '',
        company_website: '',
        job_title: '',
      });
    }
  }, [user, profile, professionalProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log('Updating profile with comprehensive sync:', data);
      
      // Use the new sync utility to update all related tables
      const syncResult = await syncProfessionalProfile(user.id, {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        company: data.company,
        bio: data.bio,
        website: data.website,
        license_number: data.license_number,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        professional_bio: data.professional_bio,
        company_address: data.company_address,
        company_website: data.company_website,
        job_title: data.job_title,
        user_type: user.user_metadata?.user_type,
      }, user.user_metadata?.user_type);

      if (syncResult.error) {
        throw new Error(syncResult.error);
      }
      
      // Only update email if it actually changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) {
          console.error('Email update error:', emailError);
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
      
      // Refresh all profile data
      await refetch();
      if (user.user_metadata?.user_type === 'realtor' || user.user_metadata?.user_type === 'mortgage_professional') {
        const updatedProfessional = await getProfessionalProfile(user.id);
        setProfessionalProfile(updatedProfessional);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium">Personal Information</h4>
              <p className="text-sm text-muted-foreground">Your basic contact details</p>
            </div>
            
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
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
          </div>

          <Separator />

          {/* Address Information Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium">Address Information</h4>
              <p className="text-sm text-muted-foreground">Your physical location details</p>
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main Street" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Professional Information Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium">Professional Information</h4>
              <p className="text-sm text-muted-foreground">Your work and business details</p>
            </div>
            
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your professional license number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Senior Loan Officer, Real Estate Agent, etc." />
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
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your company name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Company street address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Website</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://yourwebsite.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://company.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Tell us about yourself personally..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professional_bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe your professional experience, expertise, and accomplishments..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettings;
