
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';

/**
 * Custom hook to fetch professionals assigned to the current user
 * Uses a simplified approach to avoid TypeScript deep instantiation errors
 */
export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      try {
        // Step 1: Get professional_id from client_profiles - don't use any type inference
        const { data: profileData, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching client profile:', profileError);
          return [];
        }
        
        // Step 2: Extract professional_id safely
        const professionalId = profileData?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Step 3: Fetch professional data using the ID - avoid type inference
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
          
        if (professionalsError || !professionalsData) {
          console.error('Error fetching professionals:', professionalsError);
          return [];
        }
        
        // Step 4: Map raw data to professionals with explicit typing
        return professionalsData.map(rawProf => {
          // Safely determine the professional type
          let professionalType: 'realtor' | 'mortgage_broker' = 'realtor';
          if (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') {
            professionalType = rawProf.type as 'realtor' | 'mortgage_broker';
          }
          
          // Safely determine the status
          let statusValue: 'active' | 'pending' | 'inactive' = 'pending';
          if (rawProf.status === 'active' || rawProf.status === 'pending' || rawProf.status === 'inactive') {
            statusValue = rawProf.status as 'active' | 'pending' | 'inactive';
          }
          
          // Create a properly typed professional record manually
          const professionalRecord = {
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
          };
          
          return transformProfessional(professionalRecord);
        });
      } catch (err) {
        console.error('Unexpected error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
