
import React, { useEffect } from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';
import PropertySearchCard from './property-form/PropertySearchCard';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const { addActivity } = useClientActivity();
  const { saveAddress } = useSavedAddresses();
  const { user } = useAuth();
  const { displayMode, resetProcess } = usePropertyWorkflow();
  
  // Destructure the values from the hooks
  const { lmiStatus, isLoading, submitPropertySearch, resetSearch } = searchHook;

  // Clear any stale notifications on component mount
  useEffect(() => {
    const existingNotifications = document.querySelectorAll('.notification-overlay');
    existingNotifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    
    // Also reset the workflow process when component mounts
    resetProcess();
  }, [resetProcess]);

  const onSubmit = async (values: any) => {
    const result = await submitPropertySearch(values);
    if (result) {
      addActivity({
        type: 'search',
        timestamp: new Date().toISOString(),
        address: result.address,
        result: result.is_approved ? 'eligible' : 'not-eligible',
        details: result.is_approved 
          ? 'This property is in an LMI eligible area'
          : 'This property is not in an LMI eligible area'
      });
      
      if (user) {
        try {
          await saveSearch(result.address, result, user.id);
        } catch (error) {
          console.warn('Error saving search to database:', error);
        }
      }
    }
  };

  return (
    <div className="bg-blue-50/50 rounded-lg p-6 shadow-sm mb-8">
      {!lmiStatus && displayMode === 'form' && (
        <PropertySearchCard 
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
      <PropertyCheckerContent />
    </div>
  );
};

export default PropertyChecker;
