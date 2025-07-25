import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Shield, Check } from 'lucide-react';

interface ClientRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  income?: number;
  household_size?: number;
  military_status?: string;
  timeline?: string;
  first_time_buyer?: boolean;
  notes?: string;
}

export const ClientRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const invitationCode = searchParams.get('code');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClientRegistrationData>();
  const firstTimeBuyer = watch('first_time_buyer');

  useEffect(() => {
    if (!invitationCode) {
      toast.error('Invalid invitation link');
      navigate('/');
      return;
    }

    loadInvitation();
  }, [invitationCode]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('client_invitations')
        .select(`
          *,
          user_profiles!client_invitations_professional_id_fkey(
            company_name,
            user_type
          )
        `)
        .eq('invitation_code', invitationCode)
        .eq('status', 'sent')
        .single();

      if (error || !data) {
        throw new Error('Invitation not found or invalid');
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      setInvitation(data);
      
      // Pre-fill form with invitation data
      if (data.client_name) {
        const nameParts = data.client_name.split(' ');
        setValue('first_name', nameParts[0]);
        if (nameParts.length > 1) {
          setValue('last_name', nameParts.slice(1).join(' '));
        }
      }
      if (data.client_email) {
        setValue('email', data.client_email);
      }
      if (data.client_phone) {
        setValue('phone', data.client_phone);
      }
      
    } catch (error: any) {
      toast.error(error.message);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (formData: ClientRegistrationData) => {
    setIsSubmitting(true);
    try {
      // Create client profile
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          professional_id: invitation.professional_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          income: formData.income,
          household_size: formData.household_size,
          military_status: formData.military_status,
          timeline: formData.timeline,
          first_time_buyer: formData.first_time_buyer,
          notes: formData.notes,
          status: 'active',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('client_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          client_id: clientProfile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast.success('Registration completed successfully!');
      
      // Redirect to a success page or login
      navigate('/registration-success');
      
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Client Registration
          </h1>
          <p className="text-muted-foreground">
            You've been invited by{' '}
            <span className="font-semibold text-foreground">
              {invitation.user_profiles?.company_name || 'a professional'}
            </span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Secure invitation</span>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name', { required: 'First name is required' })}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name', { required: 'Last name is required' })}
                    placeholder="Smith"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="john.smith@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income</Label>
                  <Input
                    id="income"
                    type="number"
                    {...register('income', { valueAsNumber: true })}
                    placeholder="75000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="household_size">Household Size</Label>
                  <Input
                    id="household_size"
                    type="number"
                    {...register('household_size', { valueAsNumber: true })}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="military_status">Military Status</Label>
                  <Select onValueChange={(value) => setValue('military_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="active">Active Duty</SelectItem>
                      <SelectItem value="veteran">Veteran</SelectItem>
                      <SelectItem value="reserves">Reserves</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Purchase Timeline</Label>
                  <Select onValueChange={(value) => setValue('timeline', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                      <SelectItem value="short">Short-term (3-6 months)</SelectItem>
                      <SelectItem value="medium">Medium-term (6-12 months)</SelectItem>
                      <SelectItem value="long">Long-term (12+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="first_time_buyer"
                  checked={firstTimeBuyer || false}
                  onCheckedChange={(checked) => setValue('first_time_buyer', checked)}
                />
                <Label htmlFor="first_time_buyer">First-time home buyer</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional information you'd like to share..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Invitation Code: <code className="bg-muted px-1 py-0.5 rounded">{invitationCode}</code></p>
          <p className="mt-2">This invitation will expire on {new Date(invitation.expires_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};