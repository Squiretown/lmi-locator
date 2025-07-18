
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
  const { saveAddress } = useSavedAddresses();
  const { addActivity } = useClientActivity();
  const { user } = useAuth();
  
  const handleSaveProperty = async () => {
    console.log("💾 HANDLE SAVE PROPERTY called with data:", { 
      address: data.address, 
      isApproved: data.is_approved,
      hasUser: !!user,
      userId: user?.id,
      dataObject: data
    });
    
    if (!data || !data.address) {
      console.error("❌ No data or address available for saving");
      toast.error('Cannot save property', {
        description: 'Property data is missing'
      });
      return;
    }

    // Explicitly check if is_approved is true, not just truthy
    const isLmiEligible = data.is_approved === true;
    console.log(`🎯 Attempting to save address: "${data.address}" with LMI status: ${isLmiEligible}`);
    
    try {
      console.log('🔄 Calling saveAddress...');
      const success = await saveAddress(data.address, isLmiEligible);
      
      console.log("📊 Save result:", success);
      
      if (success) {
        console.log("✅ Property saved successfully");
        
        // Add activity immediately if user is authenticated
        if (user) {
          console.log('📝 Adding activity log...');
          await addActivity({
            type: 'save',
            timestamp: new Date().toISOString(),
            address: data.address,
            result: isLmiEligible ? 'eligible' : 'not-eligible',
            details: 'Property saved to collection'
          });
        }
        
        // Dispatch a custom event that listeners can use to trigger a refresh
        console.log('📡 Dispatching property-saved event...');
        const customEvent = new CustomEvent('property-saved', { 
          detail: { 
            address: data.address, 
            isLmiEligible: isLmiEligible 
          } 
        });
        window.dispatchEvent(customEvent);
        
        toast.success('Property saved successfully', {
          description: isLmiEligible ? 'LMI eligible property saved to your collection' : 'Property saved to your collection'
        });
        
        console.log("🎉 Save process completed successfully");
      } else {
        console.log("⚠️ Save failed - likely duplicate");
        toast.error('Property already saved', {
          description: 'This property is already in your saved collection'
        });
      }
    } catch (error) {
      console.error('❌ Error in handleSaveProperty:', error);
      toast.error('Failed to save property', {
        description: `An error occurred while saving the property: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
