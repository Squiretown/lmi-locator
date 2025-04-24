
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      // Step 1: Get professional ID without generic type parameter
      const profileResponse = await supabase
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      const professionalId = profileResponse.data?.professional_id;
      if (!professionalId) return [];
      
      // Step 2: Get professional data
      const professionalResponse = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId);
      
      const professionals = professionalResponse.data;
      if (!professionals || professionals.length === 0) return [];
      
      // Step 3: Transform with manual type validation
      return professionals.map(prof => {
        // Create a validated professional object that matches the expected schema
        const validProf = {
          ...prof,
          id: prof.id,
          user_id: prof.user_id,
          type: (prof.type === 'mortgage_broker' ? 'mortgage_broker' : 'realtor') as 'realtor' | 'mortgage_broker',
          name: prof.name,
          company: prof.company,
          license_number: prof.license_number,
          phone: prof.phone,
          address: prof.address,
          website: prof.website,
          bio: prof.bio,
          photo_url: prof.photo_url,
          status: (prof.status === 'active' || prof.status === 'inactive' ? prof.status : 'pending') as 'active' | 'pending' | 'inactive',
          created_at: prof.created_at,
          last_updated: prof.last_updated,
          is_verified: prof.is_verified,
          notes: prof.notes,
          social_media: prof.social_media,
          is_flagged: prof.is_flagged
        };
        
        // Use type assertion after manual validation
        return transformProfessional(validProf as ProfessionalTable);
      });
    },
    enabled: !!user
  });
};
