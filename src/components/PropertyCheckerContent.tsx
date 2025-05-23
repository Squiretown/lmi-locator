
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
    resetSearch();
    setCurrentData(null);
    resetProcess();
    
    // Only navigate when notification is closed by a logged-in user on dashboard pages
    if (user && window.location.pathname.includes('/dashboard/')) {
      toast.info('Search closed', { 
        description: 'Property search results cleared' 
      });
      
      // Navigate based on user type
      if (user?.user_metadata?.user_type === 'mortgage_professional') {
        navigate('/mortgage');
      } else if (user?.user_metadata?.user_type === 'realtor') {
        navigate('/realtor');
      } else {
        navigate('/client');
      }
    }
  };

  return (
    <PropertyCheckerLayout
      currentData={currentData}
      error={error}
      onReset={resetProcess}
      onClose={handleCloseNotification}
    />
  );
};

export default PropertyCheckerContent;
