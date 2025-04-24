
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';

/**
 * Custom hook to fetch professionals assigned to the current user
 * Uses explicit typing to avoid TypeScript deep instantiation errors
 */
export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      try {
        // Step 1: Create a typed query that avoids deep type inference
        const profileResponse = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileResponse.error) {
          console.error('Error fetching client profile:', profileResponse.error);
          return [];
        }
        
        // Step 2: Use a simple type assertion for the result
        const professionalId = profileResponse.data?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Step 3: Use a simpler typing approach for the professionals query
        type RawProfessional = {
          id: string;
          user_id: string;
          type: string;
          name: string;
          company: string;
          license_number: string;
          phone: string | null;
          address: string | null;
          website: string | null;
          bio: string | null;
          photo_url: string | null;
          status: string;
          created_at: string;
          last_updated: string;
          is_verified: boolean | null;
          is_flagged: boolean | null;
          notes: string | null;
          social_media: any;
        };
        
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
          
        if (professionalsError || !professionals) {
          console.error('Error fetching professionals:', professionalsError);
          return [];
        }
        
        // Step 4: Transform data with explicit type validations
        return professionals.map((rawProf: RawProfessional) => {
          // Handle professional type with validation
          let professionalType: 'realtor' | 'mortgage_broker' = 'realtor';
          if (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') {
            professionalType = rawProf.type as 'realtor' | 'mortgage_broker';
          }
          
          // Handle status with validation
          let statusValue: 'active' | 'pending' | 'inactive' = 'pending';
          if (rawProf.status === 'active' || rawProf.status === 'pending' || rawProf.status === 'inactive') {
            statusValue = rawProf.status as 'active' | 'pending' | 'inactive';
          }
          
          // Build the professional record with explicitly defined types
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
