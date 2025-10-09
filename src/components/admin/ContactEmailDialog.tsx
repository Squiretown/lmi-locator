import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Sparkles } from 'lucide-react';

interface ContactEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: {
    id: string;
    name: string;
    email: string;
    inquiry_type: string;
    message?: string;
    location?: string;
  } | null;
  onSend: (subject: string, message: string) => Promise<void>;
  isLoading?: boolean;
}

const EMAIL_TEMPLATES = {
  professional_match: {
    name: 'Professional Match',
    subject: 'We found the perfect professional for you!',
    message: (name: string, inquiryType: string) => 
      `Hi ${name},\n\nThank you for contacting us about ${inquiryType.replace('_', ' ')}.\n\nGreat news! We've matched you with a qualified professional in your area who specializes in exactly what you need. They'll be reaching out to you shortly to discuss how they can help.\n\nIn the meantime, if you have any questions, feel free to reply to this email.\n\nBest regards,\nThe Team`
  },
  consultation_offer: {
    name: 'Free Consultation',
    subject: 'Free consultation available for you',
    message: (name: string, inquiryType: string) => 
      `Hi ${name},\n\nThank you for your interest in ${inquiryType.replace('_', ' ')}.\n\nWe'd love to offer you a complimentary consultation to discuss your needs and how we can help. Our team of experts is ready to answer your questions and provide personalized guidance.\n\nWould you be available for a brief call this week? Simply reply to this email with your preferred time.\n\nBest regards,\nThe Team`
  },
  information_request: {
    name: 'Information Package',
    subject: 'Information about our services',
    message: (name: string, inquiryType: string) => 
      `Hi ${name},\n\nThank you for reaching out about ${inquiryType.replace('_', ' ')}.\n\nI've attached some detailed information about our services and how we can assist you. Our team has extensive experience in this area and would be happy to discuss your specific needs.\n\nPlease review the information and let us know if you have any questions. We're here to help!\n\nBest regards,\nThe Team`
  },
  follow_up: {
    name: 'Follow Up',
    subject: 'Following up on your inquiry',
    message: (name: string, inquiryType: string) => 
      `Hi ${name},\n\nI wanted to follow up on your recent inquiry about ${inquiryType.replace('_', ' ')}.\n\nHave you had a chance to review the information we sent? I'd be happy to answer any questions or schedule a time to discuss your needs in more detail.\n\nLooking forward to hearing from you.\n\nBest regards,\nThe Team`
  },
  custom: {
    name: 'Custom Message',
    subject: '',
    message: () => ''
  }
};

export const ContactEmailDialog: React.FC<ContactEmailDialogProps> = ({
  open,
  onOpenChange,
  inquiry,
  onSend,
  isLoading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('professional_match');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (inquiry && selectedTemplate) {
      const template = EMAIL_TEMPLATES[selectedTemplate];
      setSubject(template.subject);
      setMessage(template.message(inquiry.name, inquiry.inquiry_type));
    }
  }, [selectedTemplate, inquiry]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    await onSend(subject, message);
  };

  if (!inquiry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact {inquiry.name}
          </DialogTitle>
          <DialogDescription>
            Send a professional email response to this inquiry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="text-sm">
              <strong>To:</strong> {inquiry.email}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Inquiry Type:</strong> {inquiry.inquiry_type.replace('_', ' ')}
            </div>
            {inquiry.location && (
              <div className="text-sm text-muted-foreground">
                <strong>Location:</strong> {inquiry.location}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Email Template
            </Label>
            <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as keyof typeof EMAIL_TEMPLATES)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Edit the template above to personalize your message
            </p>
          </div>

          {/* Original Inquiry */}
          {inquiry.message && (
            <div className="space-y-2">
              <Label>Original Inquiry</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {inquiry.message}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !subject.trim() || !message.trim()}>
            {isLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
