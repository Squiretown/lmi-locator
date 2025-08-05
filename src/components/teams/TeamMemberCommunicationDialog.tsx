
import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare } from 'lucide-react';
import { useTeamCommunication, TeamCommunicationTemplate } from '@/hooks/useTeamCommunication';

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
  templateId?: string;
  subject?: string;
  message: string;
}

export const TeamMemberCommunicationDialog: React.FC<TeamMemberCommunicationDialogProps> = ({
  open,
  onOpenChange,
  member,
  type,
}) => {
  const [templates, setTemplates] = useState<TeamCommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TeamCommunicationTemplate | null>(null);
  const [customContent, setCustomContent] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<CommunicationFormData>();
  const { getTeamTemplates, sendTeamCommunication, replaceVariables, isLoading } = useTeamCommunication();

  const templateId = watch('templateId');
  const message = watch('message');
  const subject = watch('subject');

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template || null);
      if (template && !customContent) {
        // Replace variables in template
        const variables = {
          team_member_name: member.realtor?.name || 'Team Member',
          sender_name: 'Your Name', // This would come from user profile
          client_name: '[Client Name]',
          service_type: '[Service Type]',
          client_email: '[Client Email]',
          client_phone: '[Client Phone]',
          timeline: '[Timeline]',
          additional_notes: '[Additional Notes]',
          sender_company: '[Your Company]',
          client_details: '[Client Details]'
        };
        
        const processedContent = replaceVariables(template.content, variables);
        const processedSubject = template.subject ? replaceVariables(template.subject, variables) : '';
        
        setValue('message', processedContent);
        if (type === 'email' && template.subject) {
          setValue('subject', processedSubject);
        }
      }
    }
  }, [templateId, templates, customContent, setValue, member, type, replaceVariables]);

  const loadTemplates = async () => {
    const data = await getTeamTemplates();
    const filteredTemplates = data.filter(t => t.type === type);
    setTemplates(filteredTemplates);
    
    // Auto-select first template if available
    if (filteredTemplates.length > 0) {
      setValue('templateId', filteredTemplates[0].id);
    }
  };

  const onSubmit = async (data: CommunicationFormData) => {
    try {
      await sendTeamCommunication(
        member,
        type,
        data.subject || '',
        data.message,
        data.templateId
      );
      onOpenChange(false);
      reset();
      setCustomContent(false);
    } catch (error) {
      // Error is handled in the hook
    }
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
            <Label>
              {isEmail ? 'To Email Address' : 'To Phone Number'}
            </Label>
            <Input
              value={contactInfo || 'Not available'}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label>Template</Label>
            <Select value={templateId} onValueChange={(value) => setValue('templateId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEmail && (
            <div>
              <Label>Subject</Label>
              <Input
                {...register('subject', { required: isEmail })}
                placeholder="Enter email subject..."
                disabled={!customContent && !!selectedTemplate?.subject}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>
                {isEmail ? 'Email Message' : 'Text Message'}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustomContent(!customContent)}
              >
                {customContent ? 'Use Template' : 'Customize'}
              </Button>
            </div>
            <Textarea
              {...register('message', { required: true })}
              placeholder={`Enter your ${isEmail ? 'email' : 'text'} message...`}
              rows={isEmail ? 8 : 4}
              disabled={!customContent}
            />
            {selectedTemplate && selectedTemplate.variables && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Available variables (will be replaced automatically):</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(selectedTemplate.variables).map(([key, description]) => (
                    <code key={key} className="px-1 py-0.5 bg-muted rounded text-xs">
                      {`{{${key}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || !contactInfo}>
              {isSubmitting || isLoading ? 'Sending...' : `Send ${isEmail ? 'Email' : 'SMS'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
