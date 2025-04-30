
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { useRoleSpecificNotifications } from '@/hooks/useRoleSpecificNotifications';
import { toast } from 'sonner';

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
  
  // Check authentication status from localStorage
  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      const isAuthenticated = !!sessionStr && sessionStr !== 'null';
      setIsLoggedIn(isAuthenticated);
      
      // Try to get user type if authenticated
      if (isAuthenticated) {
        try {
          const sessionData = JSON.parse(sessionStr);
          const userMeta = sessionData?.currentSession?.user?.user_metadata;
          setUserType(userMeta?.user_type || null);
        } catch (e) {
          console.error("Error parsing user metadata:", e);
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsLoggedIn(false);
    }
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
        toast.info('Results copied to clipboard');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.info('Results copied to clipboard');
    }
  };

  const handleSaveProperty = async () => {
    console.log("Save pressed in ResultsSection");
    if (isLoggedIn) {
      await createLmiNotification(data.address, data.is_approved);
    }
    onSaveProperty();
  };

  const handleSignUp = () => {
    onCloseNotification();
    window.location.href = '/login';
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
