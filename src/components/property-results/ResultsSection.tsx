
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { Share2 } from 'lucide-react';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
  onSaveProperty: () => void;
  onCloseNotification: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  data,
  onContinue,
  onReset,
  onSaveProperty,
  onCloseNotification
}) => {
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
      } catch (err) {
        // Fallback to copy to clipboard if share fails or is cancelled
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      // Fallback for browsers that don't support sharing
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      onClose={onCloseNotification}
      onShare={handleShare}
      onSave={onSaveProperty}
      onContinue={onContinue}
    />
  );
};

export default ResultsSection;
