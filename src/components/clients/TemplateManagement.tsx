import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useClientActions, CommunicationTemplate } from '@/hooks/useClientActions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { getTemplates } = useClientActions();

  // Determine professional type based on current URL
  const professionalType = window.location.pathname.includes('/mortgage/') 
    ? 'mortgage_professional' 
    : 'realtor';

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await getTemplates(professionalType);
    setTemplates(data);
  };

  const handleCreateTemplate = async (templateData: Partial<CommunicationTemplate>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('communication_templates')
        .insert({
          name: templateData.name!,
          category: templateData.category!,
          type: templateData.type!,
          subject: templateData.subject || null,
          content: templateData.content!,
          professional_type: professionalType,
          created_by: user.id,
          is_global: false,
        });

      if (error) throw error;

      toast.success('Template created successfully');
      setShowCreateDialog(false);
      loadTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (id: string, templateData: Partial<CommunicationTemplate>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('communication_templates')
        .update(templateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Template updated successfully');
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error(error.message || 'Failed to update template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setIsLoading(false);
    }
  };

  const userTemplates = templates.filter(t => !t.is_global);
  const globalTemplates = templates.filter(t => t.is_global);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Communication Templates</h2>
          <p className="text-muted-foreground">
            Manage your email and SMS templates for client communication
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              onSubmit={handleCreateTemplate}
              isLoading={isLoading}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* User Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Your Templates ({userTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userTemplates.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No custom templates yet. Create your first template!
            </p>
          ) : (
            <div className="grid gap-4">
              {userTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={setEditingTemplate}
                  onDelete={handleDeleteTemplate}
                  canEdit={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Global Templates ({globalTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {globalTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => {}}
                onDelete={() => {}}
                canEdit={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate}
              onSubmit={(data) => handleUpdateTemplate(editingTemplate.id, data)}
              isLoading={isLoading}
              onCancel={() => setEditingTemplate(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: CommunicationTemplate;
  onEdit: (template: CommunicationTemplate) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, canEdit }) => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h3 className="font-medium">{template.name}</h3>
        <div className="flex gap-2">
          <Badge variant="secondary">{template.category}</Badge>
          <Badge variant="outline">{template.type}</Badge>
          {template.is_global && <Badge>Global</Badge>}
        </div>
      </div>
      {canEdit && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
    
    {template.subject && (
      <div>
        <Label className="text-xs font-medium">Subject:</Label>
        <p className="text-sm text-muted-foreground">{template.subject}</p>
      </div>
    )}
    
    <div>
      <Label className="text-xs font-medium">Content:</Label>
      <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
    </div>
  </div>
);

interface TemplateFormProps {
  template?: CommunicationTemplate;
  onSubmit: (data: Partial<CommunicationTemplate>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSubmit, isLoading, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'welcome',
    type: template?.type || 'email',
    subject: template?.subject || '',
    content: template?.content || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Welcome Email"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'email' | 'sms' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="status_change">Status Change</SelectItem>
            <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'email' && (
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Email subject line"
          />
        </div>
      )}

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Template content..."
          rows={6}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use variables like {'{{client_name}}'}, {'{{professional_name}}'}, {'{{professional_company}}'} in your content.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
};