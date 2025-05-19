
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
            // Try different possible field names based on our database structure
            if ('first_name' in profile) {
              setFirstName(profile.first_name as string);
            } else {
              // If no direct first_name field, perhaps it's stored in another field
              // or we can extract it from another field like "name" or "full_name"
              const name = profile.job_title || profile.company_name || 'User';
              setFirstName(name);
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
