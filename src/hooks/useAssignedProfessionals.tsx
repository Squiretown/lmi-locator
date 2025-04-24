
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
        const clientProfileResult = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (clientProfileResult.error) {
          console.error('Error fetching client profile:', clientProfileResult.error);
          return [];
        }
        
        const professionalId = clientProfileResult.data?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Fetch professional data using the ID from client profile
        const professionalsResult = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
        
        if (professionalsResult.error) {
          console.error('Error fetching professionals:', professionalsResult.error);
          return [];
        }
        
        // Map raw data to Professional objects with proper validation
        return (professionalsResult.data || []).map(rawProf => {
          // Validate professional type
          let professionalType: 'realtor' | 'mortgage_broker' = 'realtor'; // Default
          if (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') {
            professionalType = rawProf.type as 'realtor' | 'mortgage_broker';
          }
          
          // Validate status
          let statusValue: 'active' | 'pending' | 'inactive' = 'pending'; // Default
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
