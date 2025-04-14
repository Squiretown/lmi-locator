
import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { toast } from 'sonner';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const workflowHook = usePropertyWorkflow();
  const { addActivity } = useClientActivity();
  const { saveAddress } = useSavedAddresses();
  
  // Destructure the values from the hooks
  const { lmiStatus, isLoading, submitPropertySearch } = searchHook;
  const { 
    displayMode, 
    matchingPrograms, 
    handleEligibilityComplete,
    handleConnectSpecialist,
    handleSpecialistComplete,
    resetProcess,
    showResults,
    showScreener
  } = workflowHook;

  // Handle form submission
  const onSubmit = async (values: any) => {
    const result = await submitPropertySearch(values);
    if (result) {
      // Show results in the workflow
      showResults(result);
      
      // Add to recent activity
      addActivity({
        type: 'search',
        timestamp: new Date().toISOString(),
        address: result.address,
        result: result.is_approved ? 'eligible' : 'not-eligible',
        details: result.is_approved 
          ? 'This property is in an LMI eligible area'
          : 'This property is not in an LMI eligible area'
      });
    }
  };

  const handleSaveProperty = () => {
    if (lmiStatus) {
      saveAddress(
        lmiStatus.address, 
        lmiStatus.is_approved
      ).then((success) => {
        if (success) {
          addActivity({
            type: 'save',
            timestamp: new Date().toISOString(),
            address: lmiStatus.address,
            details: `Saved property to your collection`
          });
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyCheckerContent
        displayMode={displayMode}
        lmiStatus={lmiStatus}
        isLoading={isLoading}
        matchingPrograms={matchingPrograms}
        onSubmit={onSubmit}
        onContinue={showScreener}
        onReset={() => {
          resetProcess();
        }}
        onEligibilityComplete={handleEligibilityComplete}
        onConnectSpecialist={handleConnectSpecialist}
        onSpecialistComplete={handleSpecialistComplete}
        onSaveProperty={handleSaveProperty}
      />
    </div>
  );
};

export default PropertyChecker;
