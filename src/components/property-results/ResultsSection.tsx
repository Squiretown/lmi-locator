
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';

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
  return (
    <LmiStatusNotification 
      isApproved={data.is_approved}
      address={data.address}
      tractId={data.tract_id || 'Unknown'}
      onClose={onCloseNotification}
      onShare={() => console.log('Share clicked')}
      onSave={onSaveProperty}
      onContinue={onContinue}
    />
  );
};

export default ResultsSection;
