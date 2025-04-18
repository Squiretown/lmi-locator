import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { toast } from '@/hooks/use-toast';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { usePropertySearch } from '@/hooks/usePropertySearch';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, showScreener, resetProcess } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const { saveAddress } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus } = usePropertySearch();

  useEffect(() => {
    if (lmiStatus) {
      console.log("Setting current data from lmiStatus:", lmiStatus);
      setCurrentData(lmiStatus);
      showResults(lmiStatus);
    }
  }, [lmiStatus, showResults]);

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
    if (!currentData && !lmiStatus) {
      return;
    }
    showScreener();
  };

  const handleReset = () => {
    resetProcess();
    setCurrentData(null);
  };

  const handleSaveProperty = () => {
    if (currentData || lmiStatus) {
      const dataToSave = currentData || lmiStatus;
      const success = saveAddress(
        dataToSave.address || 'Unknown address', 
        dataToSave.is_approved === true
      );
      
      if (success) {
        toast.success({
          title: "Property Saved",
          description: "Property has been added to your saved properties."
        });
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
