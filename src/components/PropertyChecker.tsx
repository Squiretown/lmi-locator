
import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { toast } from 'sonner';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const workflowHook = usePropertyWorkflow();
  const { addActivity } = useClientActivity();
  const { saveAddress } = useSavedAddresses();
  const { user } = useAuth();
  
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
      
      // Save search to database if user is logged in
      if (user) {
        try {
          await saveSearch(result.address, result, user.id);
        } catch (error) {
          console.warn('Error saving search to database:', error);
        }
      }
      
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
    <div className="bg-blue-50/50 rounded-lg p-6 shadow-sm mb-8">
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
