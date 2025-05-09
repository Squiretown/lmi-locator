
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { SavedAddress } from '@/types/saved-addresses';
import { 
  fetchSavedAddresses,
  saveAddressToDatabase,
  removeAddressFromDatabase
} from '@/lib/services/savedAddressService';
import {
  getSavedAddressesFromLocalStorage,
  saveAddressToLocalStorage,
  removeAddressFromLocalStorage
} from '@/lib/services/localStorageService';
import {
  dispatchPropertySavedEvent,
  addPropertySavedListener,
  removePropertySavedListener
} from '@/lib/events/propertyEvents';

/**
 * Hook for managing user's saved addresses
 */
export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load saved addresses from API or localStorage
  const loadSavedAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        console.log("Loading saved addresses for user:", user.id);
        const addresses = await fetchSavedAddresses(user.id);
        console.log("Loaded addresses:", addresses);
        setSavedAddresses(addresses);
      } else {
        // Load from localStorage for non-authenticated users
        const addresses = getSavedAddressesFromLocalStorage();
        setSavedAddresses(addresses);
      }
      return true;
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Listen for property-saved events to update our saved addresses
  useEffect(() => {
    loadSavedAddresses();
    
    const handlePropertySaved = () => {
      console.log("useSavedAddresses: Property saved event detected");
      setTimeout(() => loadSavedAddresses(), 500); // Small delay to ensure database has updated
    };
    
    addPropertySavedListener(handlePropertySaved);
    
    return () => {
      removePropertySavedListener(handlePropertySaved);
    };
  }, [loadSavedAddresses]);

  // Save a new address
  const saveAddress = async (address: string, isLmiEligible: boolean = false) => {
    console.log(`Saving address: ${address}, LMI eligible: ${isLmiEligible}`);
    
    // Check if address is already saved to prevent duplicates
    if (savedAddresses.some(saved => saved.address === address)) {
      toast.info('This address is already saved');
      return true;
    }

    if (user?.id) {
      try {
        // Save to database for authenticated users
        const { success, id } = await saveAddressToDatabase(user.id, address, isLmiEligible);
        
        if (success && id) {
          // Immediately update the local state with the new saved property
          const newSavedAddress: SavedAddress = {
            id,
            address,
            createdAt: new Date().toISOString(),
            isLmiEligible
          };
          
          // Update local state immediately
          setSavedAddresses(prev => [newSavedAddress, ...prev]);
          
          // Dispatch event for other components to refresh
          dispatchPropertySavedEvent(address, isLmiEligible);
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error saving address:', error);
        toast.error('Failed to save address');
        return false;
      }
    } else {
      // Handle local storage for non-authenticated users
      const result = saveAddressToLocalStorage(address, isLmiEligible, savedAddresses);
      
      if (result.success) {
        setSavedAddresses(result.updatedAddresses);
        
        // Dispatch event for other components to refresh
        dispatchPropertySavedEvent(address, isLmiEligible);
        
        return true;
      }
      
      toast.error('Failed to save address');
      return false;
    }
  };

  // Remove an address
  const removeAddress = async (id: string) => {
    if (user?.id) {
      try {
        const success = await removeAddressFromDatabase(id);
        
        if (success) {
          // Update the state after successful deletion
          setSavedAddresses(prev => prev.filter(address => address.id !== id));
          return true;
        }
        
        toast.error('Failed to remove address');
        return false;
      } catch (error) {
        console.error('Error removing address:', error);
        toast.error('Failed to remove address');
        return false;
      }
    } else {
      // Handle local storage removal
      const result = removeAddressFromLocalStorage(id, savedAddresses);
      
      if (result.success) {
        setSavedAddresses(result.updatedAddresses);
        return true;
      }
      
      toast.error('Failed to remove address');
      return false;
    }
  };

  return {
    savedAddresses,
    isLoading,
    saveAddress,
    removeAddress,
    refreshAddresses: loadSavedAddresses
  };
}

export type { SavedAddress };
