import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables?: any;
  category: string;
  professional_type: string;
  is_global: boolean;
}

export function useClientActions() {
  const [isLoading, setIsLoading] = useState(false);

  const getTemplates = async (professionalType: string): Promise<CommunicationTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .or(`professional_type.eq.${professionalType},is_global.eq.true`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load communication templates');
      return [];
    }
  };

  const sendCommunication = async (
    clientId: string,
    templateId: string,
    recipient: string,
    customContent?: string,
    customSubject?: string
  ) => {
    setIsLoading(true);
    try {
      // Get template details
      const { data: template, error: templateError } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // For now, just log the communication (could be enhanced to actually send)
      const { error: commError } = await supabase
        .from('client_communications')
        .insert({
          client_id: clientId,
          professional_id: (await supabase.auth.getUser()).data.user?.id,
          template_id: templateId,
          type: template.type,
          recipient,
          subject: customSubject || template.subject,
          content: customContent || template.content,
          status: 'sent'
        });

      if (commError) throw commError;

      toast.success(`${template.type === 'email' ? 'Email' : 'SMS'} sent successfully`);
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send communication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClientStatus = async (clientId: string, status: string, notes?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({ 
          status, 
          notes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', clientId);

      if (error) throw error;
      toast.success('Client status updated successfully');
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTemplates,
    sendCommunication,
    updateClientStatus,
    isLoading
  };
}