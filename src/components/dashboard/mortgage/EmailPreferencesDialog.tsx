
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface EmailPreferencesDialogProps {
  onSendEmail: (preferences: EmailPreferences) => void;
}

export interface EmailPreferences {
  emailProgram: string;
  subject: string;
  message: string;
  recipientEmail?: string;
}

export const EmailPreferencesDialog: React.FC<EmailPreferencesDialogProps> = ({ onSendEmail }) => {
  const [open, setOpen] = useState(false);
  const [emailProgram, setEmailProgram] = useState('default');
  const [subject, setSubject] = useState('Check if Your Home Qualifies for LMI Assistance');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState(`Hi there,

I wanted to share a helpful resource with you. You can now check if a property qualifies for Low-to-Moderate Income (LMI) assistance programs and discover available benefits.

Click here to check property eligibility: ${window.location.origin}/dashboard/client

This tool will help you:
- Determine if a property is in an LMI area
- Find available assistance programs
- Explore potential benefits and savings

Feel free to reach out if you have any questions!

Best regards`);

  const handleSend = () => {
    onSendEmail({
      emailProgram,
      subject,
      message,
      recipientEmail: recipientEmail || undefined
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email-program">Preferred Email Program</Label>
            <Select value={emailProgram} onValueChange={setEmailProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Select email program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Email Client</SelectItem>
                <SelectItem value="gmail">Gmail (Web)</SelectItem>
                <SelectItem value="outlook">Outlook (Web)</SelectItem>
                <SelectItem value="yahoo">Yahoo Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipient-email">Recipient Email (Optional)</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="client@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              rows={12}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>
              Open Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
