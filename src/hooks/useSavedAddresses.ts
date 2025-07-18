
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SavedAddress } from '@/types/saved-addresses';

export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      // For unauthenticated users, use localStorage
      const saved = localStorage.getItem('savedAddresses');
      setSavedAddresses(saved ? JSON.parse(saved) : []);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const addresses: SavedAddress[] = data.map(item => ({
        id: item.id,
        address: item.address,
        isLmiEligible: item.is_lmi_eligible,
        createdAt: item.created_at,
        notes: item.notes
      }));

      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      setSavedAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveAddress = async (address: string, isLmiEligible: boolean = false): Promise<boolean> => {
    if (!user) {
      // For unauthenticated users, use localStorage
      const newAddress: SavedAddress = {
        id: crypto.randomUUID(),
        address,
        isLmiEligible,
        createdAt: new Date().toISOString(),
      };
      
      const existing = [...savedAddresses];
      // Check for duplicates
      if (existing.some(addr => addr.address === address)) {
        return false;
      }
      
      const updated = [newAddress, ...existing];
      setSavedAddresses(updated);
      localStorage.setItem('savedAddresses', JSON.stringify(updated));
      return true;
    }

    try {
      // Check for duplicates
      const { data: existing } = await supabase
        .from('saved_addresses')
        .select('id')
        .eq('address', address)
        .eq('user_id', user.id);

      if (existing && existing.length > 0) {
        return false; // Already exists
      }

      const { error } = await supabase
        .from('saved_addresses')
        .insert({
          user_id: user.id,
          address,
          is_lmi_eligible: isLmiEligible
        });

      if (error) throw error;

      await fetchAddresses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      return false;
    }
  };

  const removeAddress = async (id: string): Promise<boolean> => {
    if (!user) {
      // For unauthenticated users, use localStorage
      const updated = savedAddresses.filter(addr => addr.id !== id);
      setSavedAddresses(updated);
      localStorage.setItem('savedAddresses', JSON.stringify(updated));
      return true;
    }

    try {
      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAddresses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing address:', error);
      return false;
    }
  };

  const refreshAddresses = async (): Promise<void> => {
    await fetchAddresses();
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    savedAddresses,
    isLoading,
    saveAddress,
    removeAddress,
    refreshAddresses
  };
}

export type { SavedAddress };
