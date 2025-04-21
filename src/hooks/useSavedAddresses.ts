
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { fetchSavedAddresses, saveAddressToDb, removeAddressFromDb } from '@/lib/db/saved-addresses';
import type { SavedAddress } from '@/types/saved-addresses';

export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadSavedAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const addresses = await fetchSavedAddresses(user?.id);
      setSavedAddresses(addresses);
      console.log('Loaded saved addresses:', addresses);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    } else {
      // Load from localStorage for non-authenticated users
      const localAddresses = localStorage.getItem('savedAddresses');
      if (localAddresses) {
        try {
          setSavedAddresses(JSON.parse(localAddresses));
        } catch (error) {
          console.error('Error parsing local saved addresses:', error);
          localStorage.removeItem('savedAddresses');
          setSavedAddresses([]);
        }
      }
    }
  }, [user, loadSavedAddresses]);

  const saveAddress = async (address: string, isLmiEligible: boolean = false) => {
    console.log(`Saving address: ${address}, LMI eligible: ${isLmiEligible}`);
    
    // Check if address is already saved to prevent duplicates
    if (savedAddresses.some(saved => saved.address === address)) {
      toast.info('This address is already saved');
      return true;
    }

    if (user) {
      try {
        const success = await saveAddressToDb(user.id, { address, isLmiEligible });
        if (success) {
          await loadSavedAddresses();
          return true;
        }
      } catch (error) {
        console.error('Error saving address to DB:', error);
        toast.error('Failed to save address');
        return false;
      }
    } else {
      // Handle local storage for non-authenticated users
      try {
        const newAddress: SavedAddress = {
          id: crypto.randomUUID(),
          address,
          createdAt: new Date().toISOString(),
          isLmiEligible
        };
        const updatedAddresses = [newAddress, ...savedAddresses];
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        setSavedAddresses(updatedAddresses);
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        toast.error('Failed to save address');
        return false;
      }
    }

    return false;
  };

  const removeAddress = async (id: string) => {
    if (user) {
      try {
        const success = await removeAddressFromDb(id);
        if (success) {
          setSavedAddresses(prev => prev.filter(address => address.id !== id));
          return true;
        }
      } catch (error) {
        console.error('Error removing address:', error);
        toast.error('Failed to remove address');
        return false;
      }
    } else {
      // Handle local storage removal
      try {
        const updatedAddresses = savedAddresses.filter(address => address.id !== id);
        setSavedAddresses(updatedAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        return true;
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        toast.error('Failed to remove address');
        return false;
      }
    }
    
    return false;
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
