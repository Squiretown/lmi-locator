import { supabase } from '@/integrations/supabase/client';

interface DuplicateCheckParams {
  email: string;
  contactType: 'client' | 'realtor' | 'team_member';
  userId: string;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingContact?: {
    id: string;
    name: string;
    type: string;
  };
}

export function useDuplicateCheck() {
  const checkDuplicate = async ({
    email,
    contactType,
    userId
  }: DuplicateCheckParams): Promise<DuplicateCheckResult> => {
    
    if (!email || !email.includes('@')) {
      return { isDuplicate: false };
    }

    const emailLower = email.toLowerCase().trim();

    // Check clients
    if (contactType === 'client') {
      const { data } = await supabase
        .from('client_profiles')
        .select('id, first_name, last_name, email, professional_id')
        .eq('professional_id', userId)
        .or(`email.ilike.${emailLower}`)
        .maybeSingle();

      if (data) {
        return {
          isDuplicate: true,
          existingContact: {
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            type: 'client'
          }
        };
      }
    }

    // Check realtor partnerships
    if (contactType === 'realtor') {
      // Get current user's professional ID
      const { data: currentProf } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (currentProf) {
        // Get all partnerships for this user
        const { data: partnerships } = await supabase
          .from('professional_teams')
          .select('id, realtor_id')
          .eq('mortgage_professional_id', currentProf.id)
          .eq('status', 'active');

        if (partnerships && partnerships.length > 0) {
          const realtorIds = partnerships.map(p => p.realtor_id);
          
          // Get professional details for these realtors
          const { data: realtorProfs } = await supabase
            .from('professionals')
            .select('id, name, email')
            .in('id', realtorIds);

          const duplicate = realtorProfs?.find(
            prof => prof.email?.toLowerCase() === emailLower
          );

          if (duplicate) {
            return {
              isDuplicate: true,
              existingContact: {
                id: duplicate.id,
                name: duplicate.name,
                type: 'realtor'
              }
            };
          }
        }
      }
    }

    // Check team members
    if (contactType === 'team_member') {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          id,
          team_member_id
        `)
        .eq('team_owner_id', userId)
        .eq('status', 'active');

      if (teamMembers && teamMembers.length > 0) {
        const memberUserIds = teamMembers.map(tm => tm.team_member_id);
        
        const { data: professionals } = await supabase
          .from('professionals')
          .select('id, name, email, user_id')
          .in('user_id', memberUserIds);

        const duplicate = professionals?.find(
          p => p.email?.toLowerCase() === emailLower
        );

        if (duplicate) {
          return {
            isDuplicate: true,
            existingContact: {
              id: duplicate.id,
              name: duplicate.name,
              type: 'team_member'
            }
          };
        }
      }
    }

    // Check pending invitations (user_invitations table)
    const { data: invitationData } = await supabase
      .from('user_invitations')
      .select('id, email, first_name, last_name')
      .eq('invited_by_user_id', userId)
      .or(`email.ilike.${emailLower}`)
      .in('status', ['pending', 'sent'])
      .maybeSingle();

    if (invitationData) {
      return {
        isDuplicate: true,
        existingContact: {
          id: invitationData.id,
          name: invitationData.first_name 
            ? `${invitationData.first_name} ${invitationData.last_name || ''}`
            : invitationData.email,
          type: 'pending_invitation'
        }
      };
    }

    return { isDuplicate: false };
  };

  return { checkDuplicate };
}
