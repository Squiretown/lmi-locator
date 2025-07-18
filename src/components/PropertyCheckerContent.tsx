
import React, { useState, useEffect } from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientActivity } from '@/hooks/useClientActivity';
import PropertyCheckerLayout from './property-checker/PropertyCheckerLayout';
import { toast } from 'sonner';

const PropertyCheckerContent: React.FC = () => {
  const { displayMode, showResults, resetProcess } = usePropertyWorkflow();
  const [currentData, setCurrentData] = useState<CheckLmiStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { lmiStatus, resetSearch } = usePropertySearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addActivity } = useClientActivity();
  const isLoggedIn = !!user;

  console.log('PropertyCheckerContent - Auth status:', { isLoggedIn, user: !!user });

  useEffect(() => {
    if (lmiStatus) {
      console.log('LMI Status received in PropertyCheckerContent:', lmiStatus);
      setCurrentData(lmiStatus);
      showResults(lmiStatus);
      
      if (user && lmiStatus.address) {
        addActivity({
          type: 'search',
          timestamp: new Date().toISOString(),
          address: lmiStatus.address,
          result: lmiStatus.is_approved ? 'eligible' : 'not-eligible'
        });
      }
    }
  }, [lmiStatus, showResults, addActivity, user]);

  const handleCloseNotification = () => {
    console.log('Closing notification in PropertyCheckerContent, user logged in:', !!user);
    
    // Don't reset the search data - keep results visible
    // Only clear any error state
    setError(null);
    
    console.log('Notification closed - search results remain visible');
  };

  const handleNewSearch = () => {
    console.log('Starting new search - resetting all states');
    
    // Reset all states for a fresh search
    setCurrentData(null);
    setError(null);
    resetSearch();
    resetProcess();
    
    console.log('Ready for new search');
  };

  return (
    <PropertyCheckerLayout
      currentData={currentData}
      error={error}
      onReset={handleNewSearch}
      onClose={handleCloseNotification}
    />
  );
};

export default PropertyCheckerContent;
