
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
  onSaveProperty: () => void;
  onCloseNotification: () => void; // Add this prop
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  data,
  onContinue,
  onReset,
  onSaveProperty,
  onCloseNotification // Add to destructuring
}) => {
  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      onClose={onCloseNotification} // Use the new handler
      onShare={() => console.log('Share clicked')}
      onSave={onSaveProperty}
      onContinue={onContinue}
    />
  );
};

export default ResultsSection;

