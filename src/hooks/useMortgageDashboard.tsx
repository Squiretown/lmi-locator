
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useMortgageDashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Fetch user's profile data to get the first name
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          // Set the first name from the user profile or metadata
          if (profile) {
            setFirstName(profile.first_name);
          } else if (user.user_metadata && user.user_metadata.first_name) {
            setFirstName(user.user_metadata.first_name as string);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const handleExportResults = (results: any[]) => {
    toast.success("Export successful", {
      description: `${results.length} properties exported to your marketing list.`
    });
  };

  return {
    activeTab,
    setActiveTab,
    signOut,
    handleExportResults,
    firstName
  };
}
