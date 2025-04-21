
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EligibilityScreener from './EligibilityScreener';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, resetProcess } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const { saveAddress, refreshAddresses } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus, resetSearch } = usePropertySearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (lmiStatus) {
      setCurrentData(lmiStatus);
      showResults(lmiStatus);
    }
  }, [lmiStatus, showResults]);

  const handleCloseNotification = () => {
    resetSearch();
    setCurrentData(null);
    resetProcess();
    
    // Navigate back to the appropriate dashboard based on user metadata
    if (user?.user_metadata?.user_type === 'mortgage_professional') {
      navigate('/mortgage');
    } else if (user?.user_metadata?.user_type === 'realtor') {
      navigate('/realtor');
    } else {
      navigate('/client');
    }
  };

  const handleSaveProperty = async () => {
    console.log("Save clicked");
    if (currentData || lmiStatus) {
      const dataToSave = currentData || lmiStatus;
      const success = await saveAddress(
        dataToSave.address || 'Unknown address', 
        dataToSave.is_approved === true
      );
      
      if (success) {
        // Refresh the saved addresses to update the dashboard counters
        refreshAddresses();
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
          onReset={resetProcess}
          onSaveProperty={handleSaveProperty}
          onCloseNotification={handleCloseNotification}
        />
      )}

      {displayMode === 'screener' && (
        <EligibilityScreener
          address={(currentData || lmiStatus)?.address || ''}
          onComplete={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default PropertyCheckerContent;
