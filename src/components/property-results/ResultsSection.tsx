
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { useRoleSpecificNotifications } from '@/hooks/useRoleSpecificNotifications';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onReset: () => void;
  onSaveProperty: () => void;
  onCloseNotification: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  data,
  onReset,
  onSaveProperty,
  onCloseNotification
}) => {
  const { createLmiNotification } = useRoleSpecificNotifications();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  
  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Get the current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const isAuthenticated = !!sessionData.session;
        setIsLoggedIn(isAuthenticated);
        
        // Get user type if authenticated
        if (isAuthenticated && sessionData.session) {
          const userMeta = sessionData.session.user.user_metadata;
          setUserType(userMeta?.user_type || null);
          console.log("User is logged in as type:", userMeta?.user_type || "client");
        } else {
          console.log("User is not logged in");
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsLoggedIn(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleShare = async () => {
    const shareText = `Property LMI Status Check Results:
Address: ${data.address}
Status: ${data.is_approved ? 'LMI Eligible' : 'Not in LMI Area'}
Census Tract: ${data.tract_id || 'Unknown'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LMI Property Check Results',
          text: shareText
        });
        console.log('Content shared successfully');
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        toast("Results copied to clipboard", {
          description: "Property details have been copied to your clipboard"
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast("Results copied to clipboard", {
        description: "Property details have been copied to your clipboard"
      });
    }
  };

  const handleSaveProperty = async () => {
    console.log("Save pressed in ResultsSection, user logged in:", isLoggedIn);
    if (isLoggedIn) {
      await createLmiNotification(data.address, data.is_approved);
      toast.success('Property saved successfully', {
        description: data.is_approved 
          ? 'LMI eligible property saved to your collection'
          : 'Property saved to your collection for reference'
      });
    }
    onSaveProperty();
  };

  const handleSignUp = () => {
    onCloseNotification();
    window.location.href = '/login';
    toast("Please sign in to save properties", {
      description: 'Create an account to save and track properties'
    });
  };

  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      userType={userType}
      onClose={onCloseNotification}
      onShare={handleShare}
      onSave={isLoggedIn ? handleSaveProperty : undefined}
      onSignUp={!isLoggedIn ? handleSignUp : undefined}
    />
  );
};

export default ResultsSection;
