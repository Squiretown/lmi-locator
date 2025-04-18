
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import EligibilityScreener from './EligibilityScreener';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, showScreener, resetProcess, handleEligibilityComplete } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const { saveAddress } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus, resetSearch } = usePropertySearch();

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

  const handleCloseNotification = () => {
    console.log("Closing notification and resetting search");
    resetSearch();
    setCurrentData(null);
    resetProcess();
  };

  const handleReset = () => {
    console.log("Reset called in PropertyCheckerContent");
    handleCloseNotification();
  };

  const handleContinue = () => {
    if (!currentData && !lmiStatus) {
      return;
    }
    console.log("Continue button clicked, changing to screener mode");
    
    // First transition to screener mode
    showScreener();
    
    // Don't reset search data here since we need it for the screener
    // This was causing the problem - resetSearch() being called too early
  };

  const handleSaveProperty = () => {
    if (currentData || lmiStatus) {
      const dataToSave = currentData || lmiStatus;
      const success = saveAddress(
        dataToSave.address || 'Unknown address', 
        dataToSave.is_approved === true
      );
      
      if (success) {
        const toastElement = document.createElement('div');
        toastElement.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded shadow-lg';
        toastElement.innerHTML = `
          <div class="font-bold">Property Saved</div>
          <div class="text-sm mt-1">Property has been added to your saved properties.</div>
        `;
        document.body.appendChild(toastElement);
        
        setTimeout(() => {
          toastElement.remove();
        }, 5000);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {displayMode === 'form' && (
        <div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
        </div>
      )}

      {displayMode === 'results' && (currentData || lmiStatus) && (
        <ResultsSection
          data={currentData || lmiStatus}
          onContinue={handleContinue}
          onReset={handleReset}
          onSaveProperty={handleSaveProperty}
          onCloseNotification={handleCloseNotification}
        />
      )}

      {displayMode === 'screener' && (
        <EligibilityScreener
          address={(currentData || lmiStatus)?.address || ''}
          onComplete={handleEligibilityComplete}
        />
      )}
    </div>
  );
};

export default PropertyCheckerContent;
