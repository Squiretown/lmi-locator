
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';

/**
 * Custom hook to fetch professionals assigned to the current user
 */
export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      try {
        // Fetch client profile to get the professional ID
        const { data: clientProfile, error: clientError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (clientError) {
          console.error('Error fetching client profile:', clientError);
          return [];
        }
        
        const professionalId = clientProfile?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Fetch professional data using the ID from client profile
        const { data: professionals, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
        
        if (profError) {
          console.error('Error fetching professionals:', profError);
          return [];
        }
        
        // Process and return professional data
        return (professionals || []).map(rawProf => {
          // Validate professional type
          let professionalType: 'realtor' | 'mortgage_broker' = 'realtor';
          if (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') {
            professionalType = rawProf.type as 'realtor' | 'mortgage_broker';
          }
          
          // Validate status
          let statusValue: 'active' | 'pending' | 'inactive' = 'pending';
          if (rawProf.status === 'active' || rawProf.status === 'pending' || rawProf.status === 'inactive') {
            statusValue = rawProf.status as 'active' | 'pending' | 'inactive';
          }
          
          return transformProfessional({
            id: rawProf.id,
            user_id: rawProf.user_id,
            type: professionalType,
            name: rawProf.name,
            company: rawProf.company,
            license_number: rawProf.license_number,
            phone: rawProf.phone,
            address: rawProf.address,
            website: rawProf.website,
            bio: rawProf.bio,
            photo_url: rawProf.photo_url,
            status: statusValue,
            created_at: rawProf.created_at,
            last_updated: rawProf.last_updated,
            is_verified: rawProf.is_verified,
            is_flagged: rawProf.is_flagged,
            notes: rawProf.notes,
            social_media: rawProf.social_media
          });
        });
      } catch (err) {
        console.error('Unexpected error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
