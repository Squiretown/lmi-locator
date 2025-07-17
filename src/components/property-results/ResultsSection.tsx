
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { useRoleSpecificNotifications } from '@/hooks/useRoleSpecificNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onReset: () => void;
  onSaveProperty: () => Promise<void>;
  onCloseNotification: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  data,
  onReset,
  onSaveProperty,
  onCloseNotification
}) => {
  const { createLmiNotification } = useRoleSpecificNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Check authentication status and get user type
  useEffect(() => {
    try {
      if (user) {
        const userMeta = user.user_metadata;
        setUserType(userMeta?.user_type || 'client');
        console.log("User is logged in as type:", userMeta?.user_type || "client");
      } else {
        setUserType(null);
        console.log("User is not logged in");
      }
    } catch (error) {
      console.error("Error accessing user metadata:", error);
      setUserType('client'); // Default fallback
    }
  }, [user]);

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
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleSaveProperty = async () => {
    console.log("Save pressed in ResultsSection, user logged in:", !!user);
    
    if (isSaving) return; // Prevent multiple saves
    
    setIsSaving(true);
    
    try {
      // Create notification if user is logged in
      if (user) {
        try {
          await createLmiNotification(data.address, data.is_approved);
        } catch (notificationError) {
          console.error("Error creating notification but continuing:", notificationError);
          // Don't fail the whole save operation if notification fails
        }
      }
      
      // Call the onSaveProperty function passed from the parent component
      await onSaveProperty();
      
      console.log("Property saved successfully via ResultsSection");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignUp = () => {
    onCloseNotification();
    navigate('/login');
  };

  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      userType={userType}
      isLoggedIn={!!user}
      onClose={onCloseNotification}
      onShare={handleShare}
      onSave={user ? handleSaveProperty : undefined}
      onSignUp={!user ? handleSignUp : undefined}
    />
  );
};

export default ResultsSection;
