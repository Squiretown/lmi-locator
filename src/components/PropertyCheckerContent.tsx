import React, { useState } from 'react';
import { PropertyChecker } from '@/components/PropertyChecker';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { toast } from 'sonner';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';

const PropertyCheckerContent: React.FC = () => {
  const { currentStep, moveToStep, currentData, setCurrentData, resetWorkflow } = usePropertyWorkflow();
  const { saveAddress } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);

  const handleCheckProperty = (data: CheckLmiStatusResponse) => {
    setCurrentData(data);
    moveToStep('results');
    setError(null);
  };

  const handleError = (message: string) => {
    setError(message);
    // Don't change step when there's an error
  };

  const handleContinue = () => {
    if (!currentData) {
      return;
    }
    moveToStep('eligibility');
  };

  const handleReset = () => {
    resetWorkflow();
    moveToStep('search');
  };

  const handleSaveProperty = () => {
    if (currentData) {
      // Save the property using the useSavedAddresses hook, passing the LMI eligibility status
      const success = saveAddress(
        currentData.address || 'Unknown address', 
        currentData.is_approved === true
      );
      
      if (success) {
        toast.success('Property saved successfully!');
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {currentStep === 'search' && (
        <PropertyChecker
          onSuccess={handleCheckProperty}
          onError={handleError}
          errorMessage={error}
        />
      )}

      {currentStep === 'results' && currentData && (
        <ResultsSection
          data={currentData}
          onContinue={handleContinue}
          onReset={handleReset}
          onSaveProperty={handleSaveProperty}
        />
      )}

      {/* Other steps will be added here */}
    </div>
  );
};

export default PropertyCheckerContent;
