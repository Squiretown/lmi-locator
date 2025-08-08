
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
          
          // Set the first name - check user metadata first as it definitely has first_name
          // Then fall back to other profile fields if available
          if (user.user_metadata && user.user_metadata.first_name) {
            setFirstName(user.user_metadata.first_name as string);
          } else if (profile) {
            // Now that we've added first_name column to user_profiles, it should be available
            if (profile.first_name) {
              setFirstName(profile.first_name);
            } else {
              // Fallback to extracting from user email or generic name
              const emailName = user.email?.split('@')[0] || 'User';
              setFirstName(emailName);
            }
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
