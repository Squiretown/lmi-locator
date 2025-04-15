
import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { toast } from 'sonner';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const { addActivity } = useClientActivity();
  const { saveAddress } = useSavedAddresses();
  const { user } = useAuth();
  
  // Destructure the values from the hooks
  const { lmiStatus, isLoading, submitPropertySearch } = searchHook;

  // Handle form submission
  const onSubmit = async (values: any) => {
    const result = await submitPropertySearch(values);
    if (result) {
      // We only need to add activity when a new search is performed
      addActivity({
        type: 'search',
        timestamp: new Date().toISOString(),
        address: result.address,
        result: result.is_approved ? 'eligible' : 'not-eligible',
        details: result.is_approved 
          ? 'This property is in an LMI eligible area'
          : 'This property is not in an LMI eligible area'
      });
      
      // Save search to database if user is logged in
      if (user) {
        try {
          await saveSearch(result.address, result, user.id);
        } catch (error) {
          console.warn('Error saving search to database:', error);
        }
      }
    }
  };

  const handleSaveProperty = () => {
    if (lmiStatus) {
      saveAddress(
        lmiStatus.address, 
        lmiStatus.is_approved
      ).then((success) => {
        if (success) {
          // Only add activity if the property was saved successfully
          addActivity({
            type: 'save',
            timestamp: new Date().toISOString(),
            address: lmiStatus.address,
            details: `Saved property to your collection`
          });
          toast.success('Property saved successfully');
        }
      });
    }
  };

  return (
    <div className="bg-blue-50/50 rounded-lg p-6 shadow-sm mb-8">
      <PropertyCheckerContent />
    </div>
  );
};

export default PropertyChecker;
