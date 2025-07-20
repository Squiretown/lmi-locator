
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useForm } from 'react-hook-form';

interface InviteProfessionalData {
  email: string;
  name?: string;
  professionalType: 'realtor' | 'mortgage_broker' | 'inspector' | 'appraiser' | 'other';
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
  const { inviteRealtor, isInvitingRealtor } = useTeamManagement();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InviteProfessionalData>({
    defaultValues: {
      professionalType: 'realtor'
    }
  });

  const professionalType = watch('professionalType');

  const onInviteProfessional = async (data: InviteProfessionalData) => {
    try {
      // For now, we'll use the existing realtor invite functionality
      // This can be expanded later to support other professional types
      await inviteRealtor({
        email: data.email,
        name: data.name,
        customMessage: data.customMessage,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to invite professional:', error);
    }
  };

  const getProfessionalTypeLabel = (type: string) => {
    switch (type) {
      case 'realtor': return 'Real Estate Agent';
      case 'mortgage_broker': return 'Mortgage Broker';
      case 'inspector': return 'Home Inspector';
      case 'appraiser': return 'Property Appraiser';
      case 'other': return 'Other Professional';
      default: return 'Professional';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Professional to Team</DialogTitle>
          <DialogDescription>
            Send an invitation to a professional to join your team
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
                <SelectItem value="realtor">Real Estate Agent</SelectItem>
                <SelectItem value="mortgage_broker">Mortgage Broker</SelectItem>
                <SelectItem value="inspector">Home Inspector</SelectItem>
                <SelectItem value="appraiser">Property Appraiser</SelectItem>
                <SelectItem value="other">Other Professional</SelectItem>
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
              placeholder="Add a personal message to the invitation..."
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
            <Button type="submit" disabled={isInvitingRealtor}>
              {isInvitingRealtor ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
