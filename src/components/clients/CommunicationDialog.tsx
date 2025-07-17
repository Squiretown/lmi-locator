import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientProfile } from '@/lib/types/user-models';
import { useClientActions, CommunicationTemplate } from '@/hooks/useClientActions';

interface CommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientProfile;
  type: 'email' | 'sms';
}

export const CommunicationDialog: React.FC<CommunicationDialogProps> = ({
  open,
  onOpenChange,
  client,
  type,
}) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [customContent, setCustomContent] = useState(false);
  
  const { sendCommunication, getTemplates, isLoading } = useClientActions();

  // Determine professional type based on current URL or user metadata
  const professionalType = window.location.pathname.includes('/mortgage/') 
    ? 'mortgage_professional' 
    : 'realtor';

  useEffect(() => {
    if (open) {
      loadTemplates();
      setRecipient(type === 'email' ? client.email || '' : client.phone || '');
    }
  }, [open, type]);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSubject(template.subject || '');
        setContent(template.content);
        setCustomContent(false);
      }
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = async () => {
    const data = await getTemplates(professionalType);
    const filteredTemplates = data.filter(t => t.type === type);
    setTemplates(filteredTemplates);
    
    // Auto-select first template if available
    if (filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplateId || !recipient) return;

    try {
      await sendCommunication(
        client.id,
        selectedTemplateId,
        recipient,
        customContent ? content : undefined,
        type === 'email' && customContent ? subject : undefined
      );
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const resetForm = () => {
    setSelectedTemplateId('');
    setRecipient('');
    setSubject('');
    setContent('');
    setCustomContent(false);
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Send {type === 'email' ? 'Email' : 'SMS'} to {client.first_name} {client.last_name}
          </DialogTitle>
          <DialogDescription>
            Select a template and customize the message as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipient">
              {type === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={type === 'email' ? 'client@example.com' : '+1234567890'}
              type={type === 'email' ? 'email' : 'tel'}
            />
          </div>

          {type === 'email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                disabled={!customContent}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Message</Label>
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
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message content"
              rows={6}
              disabled={!customContent}
            />
            {selectedTemplate && selectedTemplate.variables && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Available variables:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(selectedTemplate.variables).map(([key, description]) => (
                    <code key={key} className="px-2 py-1 bg-muted rounded text-xs">
                      {`{{${key}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedTemplateId || !recipient}
          >
            {isLoading ? 'Sending...' : `Send ${type === 'email' ? 'Email' : 'SMS'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};