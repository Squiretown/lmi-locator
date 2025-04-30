
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { Share2 } from 'lucide-react';
import { useRoleSpecificNotifications } from '@/hooks/useRoleSpecificNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.user_metadata?.user_type;

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
    if (!user) {
      onCloseNotification();
      navigate('/login');
      toast.info('Please sign in to save properties');
      return;
    }
    
    console.log("Save pressed in ResultsSection");
    await createLmiNotification(data.address, data.is_approved);
    onSaveProperty();
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
      onClose={onCloseNotification}
      onShare={handleShare}
      onSave={handleSaveProperty}
    />
  );
};

export default ResultsSection;
