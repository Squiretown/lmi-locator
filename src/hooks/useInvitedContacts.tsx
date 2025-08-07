
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log('Fetching invited contacts for user:', user.id);
      
      // Get the current professional's ID first
      let professionalId = null;
      
      // Try professionals table first
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (professional) {
        professionalId = professional.id;
      } else {
        // Fallback to user_id
        professionalId = user.id;
      }

      console.log('Using professional ID:', professionalId);

      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load invited contacts');
        return;
      }

      console.log('Fetched contacts:', data?.length || 0);
      setContacts(data || []);
    } catch (error) {
      console.error('Unexpected error fetching contacts:', error);
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
      console.log('Creating invitation:', params);

      // Call the edge function to create invitation
      const { data, error } = await supabase.functions.invoke('send-professional-invitation', {
        body: {
          email: params.email,
          name: params.name,
          professionalType: 'client', // Inviting a client
          customMessage: params.customMessage
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create invitation');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create invitation');
      }

      console.log('Invitation created successfully:', data);
      toast.success('Invitation created successfully!');
      
      // Refresh the contacts list
      await fetchContacts();
      
      return data.invitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invitation';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  // Send invitation (email)
  const sendInvitation = async (invitationId: string, type: 'email' | 'sms' | 'both' = 'email') => {
    try {
      console.log('Sending invitation:', invitationId, type);

      const { data, error } = await supabase.functions.invoke('send-client-invitation', {
        body: {
          invitationId,
          type
        }
      });

      if (error) {
        console.error('Send invitation error:', error);
        throw new Error(error.message || 'Failed to send invitation');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invitation');
      }

      console.log('Invitation sent successfully:', data);
      toast.success(`Invitation sent via ${type} successfully!`);
      
      // Refresh the contacts list
      await fetchContacts();
      
      return data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete invitation
  const deleteInvitation = async (invitationId: string) => {
    try {
      console.log('Deleting invitation:', invitationId);

      const { error } = await supabase
        .from('client_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Delete invitation error:', error);
        throw new Error(error.message || 'Failed to delete invitation');
      }

      console.log('Invitation deleted successfully');
      toast.success('Invitation deleted successfully!');
      
      // Refresh the contacts list
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete invitation';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Load contacts when component mounts or user changes
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
    refreshContacts: fetchContacts
  };
};
