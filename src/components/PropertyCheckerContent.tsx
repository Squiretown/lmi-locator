
import React, { useState } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { toast } from 'sonner';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { usePropertySearch } from '@/hooks/usePropertySearch';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, showScreener, resetProcess } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const { saveAddress } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus } = usePropertySearch();

  // Use lmiStatus from usePropertySearch if available
  React.useEffect(() => {
    if (lmiStatus && !currentData) {
      setCurrentData(lmiStatus);
      showResults(lmiStatus);
    }
  }, [lmiStatus, currentData, showResults]);

  const handleCheckProperty = (data: CheckLmiStatusResponse) => {
    setCurrentData(data);
    showResults(data);
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
    showScreener();
  };

  const handleReset = () => {
    resetProcess();
    setCurrentData(null);
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
      {displayMode === 'form' && (
        <div>
          {/* Form will be rendered by PropertyChecker.tsx */}
          {error && <div className="text-red-500 mb-4">{error}</div>}
        </div>
      )}

      {displayMode === 'results' && (currentData || lmiStatus) && (
        <ResultsSection
          data={currentData || lmiStatus}
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
