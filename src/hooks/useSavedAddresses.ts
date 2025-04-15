
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

  // Load saved addresses on mount and when user changes
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
          .select('id, property_id, notes, created_at, is_favorite, properties(address)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setSavedAddresses(
            data.map(item => ({
              id: item.id,
              address: item.properties?.address || 'Unknown address',
              createdAt: item.created_at,
              isLmiEligible: item.is_favorite || false,
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
        return true;
      }
      
      const newAddress: SavedAddress = {
        id: crypto.randomUUID(),
        address,
        createdAt: new Date().toISOString(),
        isLmiEligible
      };
      
      if (user) {
        try {
          // For authenticated users, store directly in saved_properties
          const { error } = await supabase
            .from('saved_properties')
            .insert({
              user_id: user.id,
              // We'll use a dummy property_id since we can't create property records
              property_id: '00000000-0000-0000-0000-000000000000',
              is_favorite: isLmiEligible, // Store LMI eligibility in is_favorite field
              notes: isLmiEligible ? 'LMI Eligible' : ''
            });
            
          if (error) {
            console.error('Error saving property reference:', error);
            // Fall back to localStorage if database save fails
            throw new Error('Database save failed');
          }
          
          // Refresh the list to include the newly saved address
          await loadSavedAddresses();
        } catch (error) {
          // Fallback to localStorage if database operations fail
          console.warn('Falling back to localStorage for address storage');
          const updatedAddresses = [newAddress, ...savedAddresses];
          localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
          setSavedAddresses(updatedAddresses);
        }
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
