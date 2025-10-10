import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SendTeamMemberInvitationFormProps {
  onSuccess: () => void;
}

export function SendTeamMemberInvitationForm({ onSuccess }: SendTeamMemberInvitationFormProps) {
  const queryClient = useQueryClient();
  const { checkDuplicate } = useDuplicateCheck();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'loan_officer' as string,
    notes: '',
    permissions: {
      view_clients: true,
      edit_clients: false,
      send_communications: false
    }
  });

  const [emailCheck, setEmailCheck] = useState<{
    checking: boolean;
    isDuplicate: boolean;
    message?: string;
  }>({ checking: false, isDuplicate: false });

  const handleEmailChange = async (email: string) => {
    setFormData({ ...formData, email });
    
    if (email && email.includes('@')) {
      setEmailCheck({ checking: true, isDuplicate: false });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await checkDuplicate({
        email,
        contactType: 'team_member',
        userId: user.id
      });

      setEmailCheck({
        checking: false,
        isDuplicate: result.isDuplicate,
        message: result.isDuplicate 
          ? `${result.existingContact?.name} already exists in your team`
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
        contactType: 'team_member',
        userId: user.id
      });

      if (duplicateResult.isDuplicate) {
        throw new Error(`${duplicateResult.existingContact?.name} is already in your team`);
      }

      const { error } = await supabase
        .from('user_invitations')
        .insert([{
          email: formData.email.toLowerCase().trim(),
          invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
          user_type: 'mortgage_professional',
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          professional_type: 'mortgage_professional',
          custom_message: formData.notes || null,
          invited_by_user_id: user.id,
          send_via: 'email',
          status: 'pending'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member invitation sent successfully');
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="teammember@example.com"
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

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <Label htmlFor="role">Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loan_officer">Loan Officer</SelectItem>
            <SelectItem value="processor">Loan Processor</SelectItem>
            <SelectItem value="underwriter">Underwriter</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="assistant">Assistant</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Permissions</Label>
        <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox
              id="view_clients"
              checked={formData.permissions.view_clients}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  permissions: { ...formData.permissions, view_clients: !!checked }
                })
              }
            />
            <label htmlFor="view_clients" className="text-sm cursor-pointer">
              Can view clients
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit_clients"
              checked={formData.permissions.edit_clients}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  permissions: { ...formData.permissions, edit_clients: !!checked }
                })
              }
            />
            <label htmlFor="edit_clients" className="text-sm cursor-pointer">
              Can edit clients
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="send_communications"
              checked={formData.permissions.send_communications}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  permissions: { ...formData.permissions, send_communications: !!checked }
                })
              }
            />
            <label htmlFor="send_communications" className="text-sm cursor-pointer">
              Can send communications
            </label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any relevant notes about this team member..."
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
