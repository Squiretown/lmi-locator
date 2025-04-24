
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { PostgrestError } from '@supabase/supabase-js';

// Define interfaces for API responses to avoid deep type instantiation
interface ClientProfileResponse {
  data: { professional_id: string | null } | null;
  error: PostgrestError | null;
}

interface ProfessionalResponse {
  data: RawProfessionalData[] | null;
  error: PostgrestError | null;
}

// Define the raw professional data structure
interface RawProfessionalData {
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
        // Helper function to fetch client profile
        const fetchClientProfile = async (): Promise<string | null> => {
          const { data, error }: ClientProfileResponse = await supabase
            .from('client_profiles')
            .select('professional_id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Error fetching client profile:', error);
            return null;
          }
          
          return data?.professional_id || null;
        };
        
        // Helper function to fetch professional data
        const fetchProfessionalData = async (professionalId: string): Promise<Professional[]> => {
          const { data, error }: ProfessionalResponse = await supabase
            .from('professionals')
            .select('*')
            .eq('id', professionalId);
            
          if (error || !data) {
            console.error('Error fetching professionals:', error);
            return [];
          }
          
          // Transform raw data to Professional interface
          return data.map((rawProf: RawProfessionalData) => {
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
        };
        
        // Execute the data fetching flow
        const professionalId = await fetchClientProfile();
        if (!professionalId) {
          return [];
        }
        
        return await fetchProfessionalData(professionalId);
      } catch (err) {
        console.error('Unexpected error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
