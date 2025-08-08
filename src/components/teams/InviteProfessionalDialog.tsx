
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMortgageTeamManagement } from '@/hooks/useMortgageTeamManagement';
import { useForm } from 'react-hook-form';

interface InviteProfessionalData {
  email: string;
  name?: string;
  professionalType: 'mortgage_professional' | 'realtor';
  customMessage?: string;
}

interface InviteProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteProfessionalDialog: React.FC<InviteProfessionalDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { inviteProfessional, isInviting } = useMortgageTeamManagement();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InviteProfessionalData>({
    defaultValues: {
      professionalType: 'realtor'
    }
  });

  const professionalType = watch('professionalType');

  const onInviteProfessional = async (data: InviteProfessionalData) => {
    try {
      await inviteProfessional({
        email: data.email,
        role: data.professionalType === 'realtor' ? 'realtor' : 'team_member',
        professionalType: data.professionalType,
        message: data.customMessage,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to invite professional:', error);
      // Error is handled by the mutation's onError callback
    }
  };

  const getProfessionalTypeLabel = (type: string) => {
    switch (type) {
      case 'mortgage_professional': return 'Lending Team Member';
      case 'realtor': return 'Realtor Partner';
      default: return 'Professional';
    }
  };

  const getInviteDescription = (type: string) => {
    switch (type) {
      case 'mortgage_professional': return 'Invite a loan officer, processor, or other lending professional to join your team.';
      case 'realtor': return 'Invite a realtor to become a referral partner for shared client opportunities.';
      default: return 'Send an invitation to a professional to join your network.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Professional to Team</DialogTitle>
          <DialogDescription>
            {getInviteDescription(professionalType)}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onInviteProfessional)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Professional Type *</label>
            <Select 
              value={professionalType} 
              onValueChange={(value) => setValue('professionalType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select professional type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtor">Realtor Partner</SelectItem>
                <SelectItem value="mortgage_professional">Lending Team Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Email Address *</label>
            <Input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/,
                  message: 'Invalid email address'
                }
              })}
              placeholder="professional@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Name (Optional)</label>
            <Input
              {...register('name')}
              placeholder={`${getProfessionalTypeLabel(professionalType)}'s full name`}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Custom Message (Optional)</label>
            <Textarea
              {...register('customMessage')}
              placeholder={`Add a personal message to the ${professionalType === 'realtor' ? 'realtor partnership' : 'team'} invitation...`}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
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
