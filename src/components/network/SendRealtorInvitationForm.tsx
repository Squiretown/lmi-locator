import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SendRealtorInvitationFormProps {
  onSuccess: () => void;
}

export function SendRealtorInvitationForm({ onSuccess }: SendRealtorInvitationFormProps) {
  const queryClient = useQueryClient();
  const { checkDuplicate } = useDuplicateCheck();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    customMessage: ''
  });

  const [emailCheck, setEmailCheck] = useState<{
    checking: boolean;
    isDuplicate: boolean;
    message?: string;
  }>({ checking: false, isDuplicate: false });

  // Debounced email check
  const handleEmailChange = async (email: string) => {
    setFormData({ ...formData, email });
    
    if (email && email.includes('@')) {
      setEmailCheck({ checking: true, isDuplicate: false });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await checkDuplicate({
        email,
        contactType: 'realtor',
        userId: user.id
      });

      setEmailCheck({
        checking: false,
        isDuplicate: result.isDuplicate,
        message: result.isDuplicate 
          ? `${result.existingContact?.name} already exists in your network`
          : undefined
      });
    } else {
      setEmailCheck({ checking: false, isDuplicate: false });
    }
  };

  const { mutate: sendInvite, isPending } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Final duplicate check
      const duplicateResult = await checkDuplicate({
        email: formData.email,
        contactType: 'realtor',
        userId: user.id
      });

      if (duplicateResult.isDuplicate) {
        throw new Error(`${duplicateResult.existingContact?.name} is already in your network`);
      }

      const { error } = await supabase
        .from('user_invitations')
        .insert([{
          email: formData.email.toLowerCase().trim(),
          invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
          user_type: 'realtor',
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          professional_type: 'realtor',
          company_name: formData.company || null,
          custom_message: formData.customMessage || null,
          invited_by_user_id: user.id,
          send_via: 'email',
          status: 'pending'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailCheck.isDuplicate) {
      toast.error(emailCheck.message || 'This contact already exists');
      return;
    }

    sendInvite();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="realtor@example.com"
            className={emailCheck.isDuplicate ? 'border-destructive' : ''}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {emailCheck.checking && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!emailCheck.checking && emailCheck.isDuplicate && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {!emailCheck.checking && formData.email && !emailCheck.isDuplicate && formData.email.includes('@') && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
        {emailCheck.isDuplicate && (
          <p className="text-sm text-destructive mt-1">{emailCheck.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="e.g., Realty Group"
        />
      </div>

      <div>
        <Label htmlFor="customMessage">Custom Message (optional)</Label>
        <Textarea
          id="customMessage"
          value={formData.customMessage}
          onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
          placeholder="Add a personal message to the invitation..."
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isPending || emailCheck.isDuplicate || emailCheck.checking}
      >
        {isPending ? 'Sending...' : 'Send Invitation'}
      </Button>
    </form>
  );
}
