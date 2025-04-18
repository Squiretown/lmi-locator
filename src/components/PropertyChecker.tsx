import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { toast } from '@/hooks/use-toast';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';
import PropertySearchCard from './property-form/PropertySearchCard';

const PropertyChecker: React.FC = () => {
  // Initialize hooks outside of any conditional logic
  const searchHook = usePropertySearch();
  const { addActivity } = useClientActivity();
  const { saveAddress } = useSavedAddresses();
  const { user } = useAuth();
  
  // Destructure the values from the hooks
  const { lmiStatus, isLoading, submitPropertySearch } = searchHook;

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
      
      // Update notification with new toast system
      if (result.is_approved) {
        toast.success({
          title: "LMI Eligible Property",
          description: "This property is located in a Low to Moderate Income area.",
        });
      } else {
        toast.error({
          title: "Not LMI Eligible",
          description: "This property is not in an LMI eligible area.",
        });
      }
      
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
      {!lmiStatus && (
        <PropertySearchCard 
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
      {lmiStatus && <PropertyCheckerContent />}
    </div>
  );
};

export default PropertyChecker;
