
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import ResultsSection from './property-results/ResultsSection';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EligibilityScreener from './EligibilityScreener';
import { useClientActivity } from '@/hooks/useClientActivity';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, resetProcess } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const { saveAddress, refreshAddresses } = useSavedAddresses();
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus, resetSearch } = usePropertySearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addActivity } = useClientActivity();

  useEffect(() => {
    if (lmiStatus) {
      setCurrentData(lmiStatus);
      showResults(lmiStatus);
      
      // Add search activity when a property is checked
      if (lmiStatus.address) {
        addActivity({
          type: 'search',
          timestamp: new Date().toISOString(),
          address: lmiStatus.address,
          result: lmiStatus.is_approved ? 'eligible' : 'not-eligible'
        });
      }
    }
  }, [lmiStatus, showResults, addActivity]);

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
        
        // Add to activity history
        addActivity({
          type: 'save',
          timestamp: new Date().toISOString(),
          address: dataToSave.address || 'Unknown address',
          result: dataToSave.is_approved ? 'eligible' : 'not-eligible',
          details: 'Property saved to collection'
        });
        
        // Give visual feedback
        console.log("Property saved successfully");
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
