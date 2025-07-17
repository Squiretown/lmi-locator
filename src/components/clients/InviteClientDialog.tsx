import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { CreateInvitationData } from '@/hooks/useClientInvitations';
import { Mail, MessageSquare, Users } from 'lucide-react';

interface InviteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInvitationData) => Promise<any>;
  isLoading?: boolean;
}

export const InviteClientDialog: React.FC<InviteClientDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreateInvitationData>({
    defaultValues: {
      invitation_type: 'email',
      template_type: 'default',
    }
  });

  const invitationType = watch('invitation_type');

  const handleFormSubmit = async (data: CreateInvitationData) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite New Client
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a potential client via email or SMS with a unique code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              {...register('client_name')}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_email">Email Address *</Label>
            <Input
              id="client_email"
              type="email"
              {...register('client_email', { required: 'Email is required' })}
              placeholder="john.smith@example.com"
            />
            {errors.client_email && (
              <p className="text-sm text-destructive">{errors.client_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_phone">Phone Number</Label>
            <Input
              id="client_phone"
              {...register('client_phone')}
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-muted-foreground">
              Required for SMS invitations
            </p>
          </div>

          <div className="space-y-3">
            <Label>Invitation Method</Label>
            <RadioGroup
              value={invitationType}
              onValueChange={(value) => setValue('invitation_type', value as 'email' | 'sms' | 'both')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  <MessageSquare className="h-4 w-4" />
                  Both Email & SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_type">Template Type</Label>
            <Select onValueChange={(value) => setValue('template_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Welcome</SelectItem>
                <SelectItem value="mortgage">Mortgage Services</SelectItem>
                <SelectItem value="realtor">Real Estate Services</SelectItem>
                <SelectItem value="consultation">Consultation Invite</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_message">Custom Message (Optional)</Label>
            <Textarea
              id="custom_message"
              {...register('custom_message')}
              placeholder="Add a personal message to your invitation..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              This message will be included with the invitation template
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};