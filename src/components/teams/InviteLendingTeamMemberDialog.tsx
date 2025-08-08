import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useLendingTeamManagement } from '@/hooks/useLendingTeamManagement';

interface InviteLendingTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  professional_email: string;
  role: string;
  custom_message: string;
}

const TEAM_ROLES = [
  { value: 'loan_officer', label: 'Loan Officer' },
  { value: 'loan_processor', label: 'Loan Processor' },
  { value: 'underwriter', label: 'Underwriter' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'senior_loan_officer', label: 'Senior Loan Officer' },
];

export const InviteLendingTeamMemberDialog: React.FC<InviteLendingTeamMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { inviteTeamMember, isInviting } = useLendingTeamManagement();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: 'team_member',
      custom_message: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: FormData) => {
    inviteTeamMember({
      professional_email: data.professional_email,
      role: data.role,
      permissions: {
        can_view_clients: true,
        can_edit_clients: data.role === 'senior_loan_officer' || data.role === 'loan_officer',
        can_manage_team: data.role === 'senior_loan_officer',
      },
      custom_message: data.custom_message || undefined,
    });
    
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Lending Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="professional_email">Email Address</Label>
            <Input
              id="professional_email"
              type="email"
              placeholder="colleague@example.com"
              {...register('professional_email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.professional_email && (
              <p className="text-sm text-destructive">{errors.professional_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Team Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_message">Custom Message (Optional)</Label>
            <Textarea
              id="custom_message"
              placeholder="Add a personal message to the invitation..."
              rows={3}
              {...register('custom_message')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};