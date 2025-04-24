
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';

// Define simpler types for Supabase responses
type ClientProfileResponse = {
  data: { professional_id: string | null } | null;
  error: Error | null;
};

type ProfessionalData = {
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
}

type ProfessionalsResponse = {
  data: ProfessionalData[] | null;
  error: Error | null;
};

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
        
        const clientProfileResponse = clientProfileResult as ClientProfileResponse;
        
        if (clientProfileResponse.error) {
          console.error('Error fetching client profile:', clientProfileResponse.error);
          return [];
        }
        
        const professionalId = clientProfileResponse.data?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Fetch professional data using the ID from client profile
        const professionalsResult = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
        
        const professionalsResponse = professionalsResult as ProfessionalsResponse;
        
        if (professionalsResponse.error || !professionalsResponse.data) {
          console.error('Error fetching professionals:', professionalsResponse.error);
          return [];
        }
        
        // Map raw data to Professional objects
        return professionalsResponse.data.map((rawProf: ProfessionalData) => {
          // Validate professional type
          const professionalType = (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') 
            ? rawProf.type as 'realtor' | 'mortgage_broker'
            : 'realtor'; // Default fallback
          
          // Validate status
          const statusValue = (rawProf.status === 'active' || rawProf.status === 'pending' || rawProf.status === 'inactive')
            ? rawProf.status as 'active' | 'pending' | 'inactive'
            : 'pending'; // Default fallback
          
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
