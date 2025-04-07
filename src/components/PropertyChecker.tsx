
import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import PropertyCheckerContent from './PropertyCheckerContent';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const workflowHook = usePropertyWorkflow();
  
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
      showResults(result);
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
      />
    </div>
  );
};

export default PropertyChecker;
