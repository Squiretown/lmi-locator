
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare } from 'lucide-react';

interface TeamMember {
  id: string;
  realtor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    license_number: string;
  };
  status: string;
  notes?: string;
  created_at: string;
}

interface TeamMemberCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  type: 'email' | 'sms';
}

interface CommunicationFormData {
  subject?: string;
  message: string;
}

export const TeamMemberCommunicationDialog: React.FC<TeamMemberCommunicationDialogProps> = ({
  open,
  onOpenChange,
  member,
  type,
}) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CommunicationFormData>();

  const onSubmit = async (data: CommunicationFormData) => {
    // Here you would typically call an API to send the communication
    console.log('Sending', type, 'to team member:', member.id, data);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onOpenChange(false);
    reset();
  };

  const isEmail = type === 'email';
  const contactInfo = isEmail ? member.realtor?.email : member.realtor?.phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEmail ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            Send {isEmail ? 'Email' : 'SMS'} to Team Member
          </DialogTitle>
          <DialogDescription>
            Send a {isEmail ? 'email' : 'text message'} to {member.realtor?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {isEmail ? 'To Email Address' : 'To Phone Number'}
            </label>
            <Input
              value={contactInfo || 'Not available'}
              disabled
              className="bg-muted"
            />
          </div>

          {isEmail && (
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                {...register('subject', { required: isEmail })}
                placeholder="Enter email subject..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">
              {isEmail ? 'Email Message' : 'Text Message'}
            </label>
            <Textarea
              {...register('message', { required: true })}
              placeholder={`Enter your ${isEmail ? 'email' : 'text'} message...`}
              rows={isEmail ? 6 : 4}
            />
            {!isEmail && (
              <p className="text-xs text-muted-foreground mt-1">
                Keep your message concise for SMS
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !contactInfo}>
              {isSubmitting ? 'Sending...' : `Send ${isEmail ? 'Email' : 'SMS'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
