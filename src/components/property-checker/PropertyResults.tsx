
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import ResultsSection from '../property-results/ResultsSection';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PropertyResultsProps {
  data: CheckLmiStatusResponse;
  onReset: () => void;
  onClose: () => void;
}

const PropertyResults: React.FC<PropertyResultsProps> = ({
  data,
  onReset,
  onClose,
}) => {
  const { saveAddress, refreshAddresses } = useSavedAddresses();
  const { addActivity } = useClientActivity();
  const { user } = useAuth();
  
  const handleSaveProperty = async () => {
    console.log("Save clicked");
    if (data) {
      const success = await saveAddress(
        data.address || 'Unknown address', 
        data.is_approved === true
      );
      
      if (success) {
        refreshAddresses();
        
        addActivity({
          type: 'save',
          timestamp: new Date().toISOString(),
          address: data.address || 'Unknown address',
          result: data.is_approved ? 'eligible' : 'not-eligible',
          details: 'Property saved to collection'
        });
      }
    }
  };

  return (
    <ResultsSection
      data={data}
      onReset={onReset}
      onSaveProperty={handleSaveProperty}
      onCloseNotification={onClose}
    />
  );
};

export default PropertyResults;
