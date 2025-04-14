
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SavedAddress {
  id: string;
  address: string;
  createdAt: string;
  isLmiEligible?: boolean;
  notes?: string;
}

export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load saved addresses on mount
  useEffect(() => {
    loadSavedAddresses();
  }, [user]);

  // Load saved addresses from localStorage (for non-authenticated users)
  // or from Supabase (for authenticated users)
  const loadSavedAddresses = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Load from Supabase if user is authenticated
        const { data, error } = await supabase
          .from('saved_properties')
          .select('id, address, created_at, is_favorite, notes, property_id, folder')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setSavedAddresses(
            data.map(item => ({
              id: item.id,
              address: item.address,
              createdAt: item.created_at,
              isLmiEligible: item.is_favorite || false, // Using is_favorite to indicate LMI eligibility
              notes: item.notes
            }))
          );
        }
      } else {
        // Load from localStorage if user is not authenticated
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
          const parsedAddresses = JSON.parse(saved);
          // Convert to our SavedAddress format if it's just an array of strings
          if (Array.isArray(parsedAddresses)) {
            if (typeof parsedAddresses[0] === 'string') {
              setSavedAddresses(
                parsedAddresses.map((address: string) => ({
                  id: crypto.randomUUID(),
                  address,
                  createdAt: new Date().toISOString(),
                  isLmiEligible: false
                }))
              );
            } else {
              setSavedAddresses(parsedAddresses);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  };

  // Save an address
  const saveAddress = async (address: string, isLmiEligible: boolean = false) => {
    try {
      // Don't save if it's already in the list
      if (savedAddresses.some(saved => saved.address === address)) {
        toast.info('This address is already saved');
        return;
      }
      
      const newAddress: SavedAddress = {
        id: crypto.randomUUID(),
        address,
        createdAt: new Date().toISOString(),
        isLmiEligible
      };
      
      if (user) {
        // Save to Supabase if user is authenticated
        const { error } = await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            address,
            property_id: null, // We don't have a property_id yet
            is_favorite: isLmiEligible, // Mark eligible properties as favorites by default
            notes: isLmiEligible ? 'LMI Eligible' : ''
          });
          
        if (error) throw error;
        
        // Refresh the list to include the newly saved address
        await loadSavedAddresses();
      } else {
        // Save to localStorage if user is not authenticated
        const updatedAddresses = [newAddress, ...savedAddresses];
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        setSavedAddresses(updatedAddresses);
      }
      
      toast.success('Address saved to your collection');
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
      return false;
    }
  };

  // Remove an address
  const removeAddress = async (id: string) => {
    try {
      if (user) {
        // Remove from Supabase if user is authenticated
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Update the state after successful deletion
        setSavedAddresses(prevAddresses => prevAddresses.filter(address => address.id !== id));
      } else {
        // Update state and localStorage
        const updatedAddresses = savedAddresses.filter(address => address.id !== id);
        setSavedAddresses(updatedAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      }
      
      toast.success('Address removed from your collection');
      return true;
    } catch (error) {
      console.error('Error removing address:', error);
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
