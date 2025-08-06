import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'mortgage_professional' | 'realtor' | 'client';
  phone?: string;
  company?: string;
  license_number?: string;
}

export function useAdminUserCreation() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userType = user.user_metadata?.user_type;
      if (userType !== 'admin') {
        throw new Error('Admin privileges required');
      }

      // Create user via edge function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          user_metadata: {
            user_type: userData.user_type,
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });

      if (error) throw error;

      // If creating a professional, also create professional profile
      if (userData.user_type === 'mortgage_professional' || userData.user_type === 'realtor') {
        const { error: profileError } = await supabase
          .from('professionals')
          .insert({
            user_id: data.user.id,
            name: `${userData.first_name} ${userData.last_name}`,
            type: userData.user_type,
            professional_type: userData.user_type,
            company: userData.company || 'Independent',
            license_number: userData.license_number || 'TBD',
            phone: userData.phone,
            status: 'active'
          });

        if (profileError) {
          console.warn('Failed to create professional profile:', profileError);
          // Don't throw here as user was created successfully
        }
      }

      return data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  return {
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
  };
}