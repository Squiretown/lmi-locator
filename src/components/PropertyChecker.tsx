
import React from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertyCheckerContent from './PropertyCheckerContent';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import { saveSearch } from '@/lib/supabase/search';
import { useAuth } from '@/hooks/useAuth';
import PropertySearchCard from './property-form/PropertySearchCard';
import { toast } from '@/hooks/use-toast';

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
      
      // Manually create and append toast notifications
      if (result.is_approved) {
        const toastElement = document.createElement('div');
        toastElement.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded shadow-lg';
        toastElement.innerHTML = `
          <div class="font-bold">LMI Eligible Property</div>
          <div class="text-sm mt-1">This property is located in a Low to Moderate Income area.</div>
        `;
        document.body.appendChild(toastElement);
        
        setTimeout(() => {
          toastElement.remove();
        }, 5000);
      } else {
        const toastElement = document.createElement('div');
        toastElement.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded shadow-lg';
        toastElement.innerHTML = `
          <div class="font-bold">Not LMI Eligible</div>
          <div class="text-sm mt-1">This property is not in an LMI eligible area.</div>
        `;
        document.body.appendChild(toastElement);
        
        setTimeout(() => {
          toastElement.remove();
        }, 5000);
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
