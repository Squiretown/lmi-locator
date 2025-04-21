
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import ResultsSection from '../property-results/ResultsSection';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
    console.log("Save property initiated with data:", data);
    if (data) {
      // Explicitly check if is_approved is true, not just truthy
      const isLmiEligible = data.is_approved === true;
      console.log(`Saving address with LMI status: ${isLmiEligible}`);
      
      try {
        const success = await saveAddress(
          data.address || 'Unknown address', 
          isLmiEligible
        );
        
        if (success) {
          await refreshAddresses();
          
          toast.success('Property saved successfully', {
            description: isLmiEligible ? 'LMI eligible property saved to your collection' : 'Property saved to your collection'
          });
          
          addActivity({
            type: 'save',
            timestamp: new Date().toISOString(),
            address: data.address || 'Unknown address',
            result: isLmiEligible ? 'eligible' : 'not-eligible',
            details: 'Property saved to collection'
          });
        }
      } catch (error) {
        console.error('Error saving property:', error);
        toast.error('Failed to save property');
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
