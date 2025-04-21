
import { useState, useEffect, useCallback } from 'react';
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

  // Load saved addresses function
  const loadSavedAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Load from Supabase if user is authenticated
        // Join saved_properties with properties to get the address
        const { data, error } = await supabase
          .from('saved_properties')
          .select(`
            id, 
            notes, 
            created_at, 
            is_favorite,
            property_id
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Create a temporary array to hold the complete saved addresses
          const tempAddresses: SavedAddress[] = [];
          
          // For each saved property, get its address from the property_id
          for (const item of data) {
            try {
              // For simplicity, we'll use the property_id as an address if we can't get the real one
              let addressText = `Property ID: ${item.property_id}`;
              
              // Attempt to get the property details to get the address
              const { data: propertyData, error: propertyError } = await supabase
                .from('properties')
                .select('address')
                .eq('id', item.property_id)
                .single();
                
              if (!propertyError && propertyData) {
                addressText = propertyData.address;
              }
              
              tempAddresses.push({
                id: item.id,
                address: addressText,
                createdAt: item.created_at,
                isLmiEligible: item.is_favorite || false,
                notes: item.notes
              });
            } catch (err) {
              console.error('Error getting property details:', err);
              // Still add the item with a placeholder address
              tempAddresses.push({
                id: item.id,
                address: `Property ID: ${item.property_id}`,
                createdAt: item.created_at,
                isLmiEligible: item.is_favorite || false,
                notes: item.notes
              });
            }
          }
          
          setSavedAddresses(tempAddresses);
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
  }, [user]);

  // Load saved addresses on mount and when user changes
  useEffect(() => {
    loadSavedAddresses();
  }, [user, loadSavedAddresses]);

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
          // First check if we need to create a property record
          let propertyId = '00000000-0000-0000-0000-000000000000';
          
          // Check if this property exists
          const { data: existingProperty } = await supabase
            .from('properties')
            .select('id')
            .eq('address', address)
            .maybeSingle();
            
          if (existingProperty) {
            propertyId = existingProperty.id;
          } else {
            // Create a new property record
            const { data: newProperty, error: propertyError } = await supabase
              .from('properties')
              .insert({
                address: address,
                price: 0, // Required field but we don't have real data
                city: '',  // Required field but we don't have real data
                state: '', // Required field but we don't have real data
                zip_code: '', // Required field but we don't have real data
                mls_number: crypto.randomUUID(), // Required field but we don't have real data
                is_lmi_eligible: isLmiEligible
              })
              .select('id')
              .single();
              
            if (propertyError) {
              console.error('Error creating property:', propertyError);
              throw new Error('Failed to create property record');
            }
            
            if (newProperty) {
              propertyId = newProperty.id;
            }
          }
          
          // Now save the reference in saved_properties
          const { error } = await supabase
            .from('saved_properties')
            .insert({
              user_id: user.id,
              property_id: propertyId,
              is_favorite: isLmiEligible,
              notes: isLmiEligible ? 'LMI Eligible' : ''
            });
            
          if (error) {
            console.error('Error saving property reference:', error);
            // Fall back to localStorage if database save fails
            throw new Error('Database save failed');
          }
          
          // Refresh the list to include the newly saved address
          await loadSavedAddresses();
          toast.success('Address saved to your collection');
          return true;
        } catch (error) {
          // Fallback to localStorage if database operations fail
          console.warn('Falling back to localStorage for address storage');
          const updatedAddresses = [newAddress, ...savedAddresses];
          localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
          setSavedAddresses(updatedAddresses);
          toast.success('Address saved to your collection');
          return true;
        }
      } else {
        // Save to localStorage if user is not authenticated
        const updatedAddresses = [newAddress, ...savedAddresses];
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        setSavedAddresses(updatedAddresses);
        toast.success('Address saved to your collection');
        return true;
      }
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
        toast.success('Address removed from your collection');
      } else {
        // Update state and localStorage
        const updatedAddresses = savedAddresses.filter(address => address.id !== id);
        setSavedAddresses(updatedAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        toast.success('Address removed from your collection');
      }
      
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
