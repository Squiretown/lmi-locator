import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientAction {
  id: string;
  client_id: string;
  professional_id: string;
  activity_type: string;
  activity_data?: any;
  description: string;
  created_at: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  category: string;
  type: 'email' | 'sms';
  professional_type: string;
  subject?: string;
  content: string;
  variables?: Record<string, string>;
  is_global: boolean;
  created_by?: string;
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  professional_id: string;
  template_id?: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  sent_at: string;
}

export const useClientActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const logActivity = async (
    clientId: string,
    activityType: string,
    description: string,
    activityData?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_activity_logs')
        .insert({
          client_id: clientId,
          professional_id: user.id,
          activity_type: activityType,
          description,
          activity_data: activityData || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateClientStatus = async (
    clientId: string,
    newStatus: string,
    reason?: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData: any = { status: newStatus };
      
      if (newStatus === 'deactivated') {
        updateData.deactivated_at = new Date().toISOString();
        updateData.deactivated_by = user.id;
        updateData.status_reason = reason;
      } else if (newStatus === 'active') {
        updateData.deactivated_at = null;
        updateData.deactivated_by = null;
        updateData.status_reason = null;
      }

      const { error } = await supabase
        .from('client_profiles')
        .update(updateData)
        .eq('id', clientId);

      if (error) throw error;

      // Log the activity
      await logActivity(
        clientId,
        'status_change',
        `Client status changed to ${newStatus}${reason ? ` - ${reason}` : ''}`,
        { old_status: 'active', new_status: newStatus, reason }
      );

      // Invalidate React Query cache to update UI without page refresh
      await queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['realtor-client-profiles'] });

      toast.success(`Client status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating client status:', error);
      toast.error(error.message || 'Failed to update client status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplates = async (professionalType: string) => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .or(`professional_type.eq.${professionalType},professional_type.eq.both`)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as CommunicationTemplate[];
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get template and client info
      const [templateResult, clientResult] = await Promise.all([
        supabase.from('communication_templates').select('*').eq('id', templateId).single(),
        supabase.from('client_profiles').select('*').eq('id', clientId).single()
      ]);

      if (templateResult.error) throw templateResult.error;
      if (clientResult.error) throw clientResult.error;

      const template = templateResult.data as CommunicationTemplate;
      const client = clientResult.data;

      // Replace template variables
      const variables = {
        client_name: `${client.first_name} ${client.last_name}`,
        professional_name: user.user_metadata?.name || 'Professional',
        professional_company: user.user_metadata?.company || 'Our Company',
        ...template.variables,
      };

      let content = customContent || template.content;
      let subject = customSubject || template.subject || '';

      // Replace variables in content and subject
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
      });

      // Save communication record
      const { error: commError } = await supabase
        .from('client_communications')
        .insert({
          client_id: clientId,
          professional_id: user.id,
          template_id: templateId,
          type: template.type,
          recipient,
          subject: template.type === 'email' ? subject : null,
          content,
          status: 'sent',
        });

      if (commError) throw commError;

      // Log the activity
      await logActivity(
        clientId,
        'communication_sent',
        `Sent ${template.type} using template "${template.name}"`,
        { template_name: template.name, type: template.type, recipient }
      );

      // Call edge function to actually send the communication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: recipient,
          type: 'client',
          clientName: `${client.first_name} ${client.last_name}`,
          customMessage: content,
          invitationType: template.type
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (sendError) {
        console.warn('Failed to send communication:', sendError);
        // Update status to failed but don't throw - record is already saved
        await supabase
          .from('client_communications')
          .update({ status: 'failed', error_message: sendError.message })
          .eq('client_id', clientId)
          .eq('professional_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(1);
      }

      toast.success(`${template.type === 'email' ? 'Email' : 'SMS'} sent successfully`);
    } catch (error: any) {
      console.error('Error sending communication:', error);
      toast.error(error.message || 'Failed to send communication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getClientActivities = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_activity_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientAction[];
    } catch (error: any) {
      console.error('Error fetching client activities:', error);
      return [];
    }
  };

  const getClientCommunications = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_communications')
        .select('*')
        .eq('client_id', clientId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as ClientCommunication[];
    } catch (error: any) {
      console.error('Error fetching client communications:', error);
      return [];
    }
  };

  return {
    isLoading,
    updateClientStatus,
    sendCommunication,
    getTemplates,
    getClientActivities,
    getClientCommunications,
    logActivity,
  };
};