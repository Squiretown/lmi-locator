import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UnifiedInvitationPayload, StandardInvitationHeaders } from '@/types/invitations';

interface InvitedContact {
  id: string;
  client_email: string;
  client_name: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  invitation_code: string;
  email_sent: boolean;
  sms_sent: boolean;
}

interface CreateInvitationParams {
  email: string;
  name?: string;
  phone?: string;
  customMessage?: string;
}

export const useInvitedContacts = () => {
  const [contacts, setContacts] = useState<InvitedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const { user } = useAuth();

  // Fetch contacts
  const fetchContacts = async () => {
    if (!user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    try {
      let professionalId: string | null = null;
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!professional) {
        setContacts([]);
        return;
      }

      professionalId = professional.id;

      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('invitation_target_type', 'client')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load invited contacts');
        return;
      }

      setContacts(data || []);
    } catch (error) {
      toast.error('Failed to load invited contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Create invitation
  const createInvitation = async (params: CreateInvitationParams) => {
    if (!user) {
      toast.error('You must be logged in to create invitations');
      return;
    }

    setIsCreatingInvitation(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication session expired. Please refresh and try again.');
      }

      const unifiedPayload: UnifiedInvitationPayload = {
        target: 'client',
        channel: 'email',
        recipient: {
          email: params.email,
          name: params.name,
          phone: params.phone
        },
        context: {
          customMessage: params.customMessage
        }
      };

      const headers: StandardInvitationHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: unifiedPayload,
        headers,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create invitation');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create invitation');
      }

      toast.success('Invitation created successfully!');
      await fetchContacts();
      return data.invitation;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invitation');
      throw error;
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  // Send invitation (resend)
  const sendInvitation = async (invitationId: string, type: 'email' | 'sms' | 'both' = 'email') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const headers: StandardInvitationHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: { 
          invitationId, 
          action: 'resend',
          type 
        },
        headers
      });

      if (error) {
        throw new Error(error.message || 'Failed to send invitation');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invitation');
      }

      toast.success(`Invitation sent via ${type} successfully!`);
      await fetchContacts();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
      throw error;
    }
  };

  // Delete invitation
  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('client_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        throw new Error(error.message || 'Failed to delete invitation');
      }

      toast.success('Invitation deleted successfully!');
      await fetchContacts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invitation');
      throw error;
    }
  };

  // Load contacts on mount/user change
  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    isLoading,
    isCreatingInvitation,
    createInvitation,
    sendInvitation,
    deleteInvitation,
    refreshContacts: fetchContacts,
  };
};