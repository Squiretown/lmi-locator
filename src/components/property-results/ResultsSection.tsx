import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { Share2 } from 'lucide-react';
import { useRoleSpecificNotifications } from '@/hooks/useRoleSpecificNotifications';

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
        alert('Results copied to clipboard');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard');
    }
  };

  const handleSaveProperty = async () => {
    console.log("Save pressed in ResultsSection");
    await createLmiNotification(data.address, data.is_approved);
    onSaveProperty();
  };

  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      onClose={onCloseNotification}
      onShare={handleShare}
      onSave={handleSaveProperty}
    />
  );
};

export default ResultsSection;
