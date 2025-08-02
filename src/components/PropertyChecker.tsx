
import React, { useEffect } from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';
import PropertySearchCard from './property-form/PropertySearchCard';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import { toast } from 'sonner';

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
    console.log('Property search submitted, user authenticated:', !!user);
    const result = await submitPropertySearch(values);
    
    if (result) {
      if (user) {
        addActivity({
          type: 'search',
          timestamp: new Date().toISOString(),
          address: result.address,
          result: result.is_approved ? 'eligible' : 'not-eligible',
          details: result.is_approved 
            ? 'This property is in an LMI eligible area'
            : 'This property is not in an LMI eligible area'
        });
        
        try {
          // Save search history
          await saveSearch(result.address, result, user.id);
          
          // NEW: Also save as a property address
          console.log('Attempting to save address:', result.address, 'LMI eligible:', result.is_approved);
          const saved = await saveAddress(result.address, result.is_approved);
          
          if (saved) {
            toast.success('Property saved!', {
              description: `${result.address} has been added to your saved properties`
            });
            console.log('Property successfully saved to saved addresses');
          } else {
            console.log('Property not saved (likely duplicate)');
            // Don't show error toast for duplicates as this is expected behavior
          }
          
        } catch (error) {
          console.error('Error saving search to database:', error);
          toast.error('Error saving search', {
            description: 'Unable to save your search to your history'
          });
        }
      }
    }
  };

  return (
    <div className="bg-blue-50/50 rounded-lg p-6 shadow-sm mb-8">
      {displayMode === 'form' && (
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
