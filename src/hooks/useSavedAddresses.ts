
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { SavedAddress } from '@/types/saved-addresses';

export async function fetchSavedAddresses(userId?: string): Promise<SavedAddress[]> {
  if (!userId) return [];

  try {
    console.log("Fetching saved addresses for user:", userId);
    
    // Query to get saved properties with their related property information
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        id,
        notes,
        created_at,
        is_favorite,
        property_id,
        properties(address, is_lmi_eligible)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('DB error fetching saved addresses:', error);
      throw error;
    }

    console.log("Saved addresses raw data:", data);

    // Map the data to our SavedAddress type
    return data.map(item => {
      const properties = item.properties as any;
      return {
        id: item.id,
        address: properties?.address || 'Unknown address',
        createdAt: item.created_at,
        isLmiEligible: properties?.is_lmi_eligible || item.is_favorite || false,
        notes: item.notes
      };
    });
  } catch (error) {
    console.error('Error fetching saved addresses:', error);
    return [];
  }
}

export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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
        const localAddresses = localStorage.getItem('savedAddresses');
        if (localAddresses) {
          try {
            const parsed = JSON.parse(localAddresses);
            console.log("Loaded addresses from localStorage:", parsed);
            setSavedAddresses(parsed);
          } catch (error) {
            console.error('Error parsing local saved addresses:', error);
            localStorage.removeItem('savedAddresses');
            setSavedAddresses([]);
          }
        } else {
          setSavedAddresses([]);
        }
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
    
    return true;
  }, [user]);

  useEffect(() => {
    loadSavedAddresses();
  }, [loadSavedAddresses]);

  const saveAddress = async (address: string, isLmiEligible: boolean = false) => {
    console.log(`Saving address: ${address}, LMI eligible: ${isLmiEligible}`);
    
    // Check if address is already saved to prevent duplicates
    if (savedAddresses.some(saved => saved.address === address)) {
      toast.info('This address is already saved');
      return true;
    }

    if (user?.id) {
      try {
        console.log("Saving to DB for user:", user.id);
        
        // First check if this property exists
        let propertyId: string;
        
        const { data: existingProperty } = await supabase
          .from('properties')
          .select('id, is_lmi_eligible')
          .eq('address', address)
          .maybeSingle();
          
        if (existingProperty) {
          propertyId = existingProperty.id;
          
          // If the property exists but LMI status is different, update it
          if (existingProperty.is_lmi_eligible !== isLmiEligible) {
            await supabase
              .from('properties')
              .update({ is_lmi_eligible: isLmiEligible })
              .eq('id', propertyId);
          }
        } else {
          // Create a new property record with the LMI status
          const { data: newProperty, error: propertyError } = await supabase
            .from('properties')
            .insert({
              address: address,
              price: 0, // Required field
              city: '',
              state: '',
              zip_code: '',
              mls_number: crypto.randomUUID(),
              is_lmi_eligible: isLmiEligible
            })
            .select('id')
            .single();
            
          if (propertyError || !newProperty) {
            console.error('Failed to create property record:', propertyError);
            throw new Error('Failed to create property record');
          }
          
          propertyId = newProperty.id;
        }
        
        // Now save the reference in saved_properties
        // Note: is_favorite is used as a backup for the LMI status
        const { data: savedProperty, error } = await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            property_id: propertyId,
            is_favorite: isLmiEligible, // Use is_favorite to store LMI status as a backup
          })
          .select('id')
          .single();
          
        if (error) {
          console.error('Error inserting saved property:', error);
          throw error;
        }
        
        console.log("Property saved successfully with ID:", savedProperty.id);
        
        // Update the local state with the new saved property
        const newSavedAddress: SavedAddress = {
          id: savedProperty.id,
          address,
          createdAt: new Date().toISOString(),
          isLmiEligible
        };
        
        setSavedAddresses(prev => [newSavedAddress, ...prev]);
        
        return true;
      } catch (error) {
        console.error('Error saving address:', error);
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
  };

  const removeAddress = async (id: string) => {
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Update the state after successful deletion
        setSavedAddresses(prev => prev.filter(address => address.id !== id));
        return true;
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
