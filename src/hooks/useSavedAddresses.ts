
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
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedAddresses();
  }, [user, loadSavedAddresses]);

  const saveAddress = async (address: string, isLmiEligible: boolean = false) => {
    if (savedAddresses.some(saved => saved.address === address)) {
      toast.info('This address is already saved');
      return true;
    }

    if (user) {
      const success = await saveAddressToDb(user.id, { address, isLmiEligible });
      if (success) {
        await loadSavedAddresses();
        toast.success('Address saved to your collection');
        return true;
      }
    } else {
      // Handle local storage for non-authenticated users
      const newAddress: SavedAddress = {
        id: crypto.randomUUID(),
        address,
        createdAt: new Date().toISOString(),
        isLmiEligible
      };
      const updatedAddresses = [newAddress, ...savedAddresses];
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      setSavedAddresses(updatedAddresses);
      toast.success('Address saved to your collection');
      return true;
    }

    toast.error('Failed to save address');
    return false;
  };

  const removeAddress = async (id: string) => {
    if (user) {
      const success = await removeAddressFromDb(id);
      if (success) {
        setSavedAddresses(prev => prev.filter(address => address.id !== id));
        toast.success('Address removed from your collection');
        return true;
      }
    } else {
      // Handle local storage removal
      const updatedAddresses = savedAddresses.filter(address => address.id !== id);
      setSavedAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      toast.success('Address removed from your collection');
      return true;
    }
    
    toast.error('Failed to remove address');
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
