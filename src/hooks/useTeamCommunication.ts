import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamCommunicationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables?: any;
  is_global: boolean;
}

export interface TeamMember {
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

export function useTeamCommunication() {
  const [isLoading, setIsLoading] = useState(false);

  const getTeamTemplates = async (): Promise<TeamCommunicationTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('team_communication_templates')
        .select('*')
        .eq('is_global', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team templates:', error);
      toast.error('Failed to load team communication templates');
      return [];
    }
  };

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || `[${key}]`);
    });
    return result;
  };

  const sendTeamCommunication = async (
    member: TeamMember,
    type: 'email' | 'sms',
    subject: string,
    message: string,
    templateId?: string
  ) => {
    setIsLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const contactInfo = type === 'email' ? member.realtor?.email : member.realtor?.phone;
      if (!contactInfo) {
        throw new Error(`No ${type === 'email' ? 'email address' : 'phone number'} available for team member`);
      }

      // Send via edge function
      const { data, error } = await supabase.functions.invoke('send-team-communication', {
        body: {
          type,
          recipient: contactInfo,
          subject: type === 'email' ? subject : undefined,
          content: message,
          team_member_name: member.realtor?.name,
        }
      });

      if (error) throw error;

      // Log the communication
      const { error: logError } = await supabase
        .from('team_communications')
        .insert({
          sender_id: user.data.user.id,
          team_member_id: member.id,
          team_member_email: type === 'email' ? contactInfo : null,
          team_member_phone: type === 'sms' ? contactInfo : null,
          type,
          subject: type === 'email' ? subject : null,
          content: message,
          status: data?.success ? 'sent' : 'failed',
          error_message: data?.success ? null : data?.error,
        });

      if (logError) {
        console.error('Error logging communication:', logError);
      }

      toast.success(`${type === 'email' ? 'Email' : 'SMS'} sent successfully to ${member.realtor?.name}`);
    } catch (error: any) {
      console.error('Error sending team communication:', error);
      toast.error(error.message || 'Failed to send communication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTeamTemplates,
    sendTeamCommunication,
    replaceVariables,
    isLoading
  };
}