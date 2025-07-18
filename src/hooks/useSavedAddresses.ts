
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SavedAddress } from '@/types/saved-addresses';

export function useSavedAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  console.log('useSavedAddresses - User state:', { 
    hasUser: !!user, 
    userId: user?.id,
    userMetadata: user?.user_metadata 
  });

  const fetchAddresses = useCallback(async () => {
    console.log('fetchAddresses called, user:', !!user);
    
    if (!user) {
      console.log('No user, loading from localStorage');
      // For unauthenticated users, use localStorage
      const saved = localStorage.getItem('savedAddresses');
      const addresses = saved ? JSON.parse(saved) : [];
      console.log('Loaded from localStorage:', addresses.length, 'addresses');
      setSavedAddresses(addresses);
      setIsLoading(false);
      return;
    }

    console.log('User authenticated, fetching from Supabase for user:', user.id);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const addresses: SavedAddress[] = (data || []).map(item => ({
        id: item.id,
        address: item.address,
        isLmiEligible: item.is_lmi_eligible,
        createdAt: item.created_at,
        notes: item.notes
      }));

      console.log('Processed addresses:', addresses);
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      setSavedAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveAddress = async (address: string, isLmiEligible: boolean = false): Promise<boolean> => {
    console.log('💾 SAVE ADDRESS CALLED:', { 
      address, 
      isLmiEligible, 
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email 
    });
    
    if (!address || !address.trim()) {
      console.error('❌ Invalid address provided');
      return false;
    }
    
    if (!user) {
      console.log('📱 Saving to localStorage for unauthenticated user');
      // For unauthenticated users, use localStorage
      const newAddress: SavedAddress = {
        id: crypto.randomUUID(),
        address: address.trim(),
        isLmiEligible,
        createdAt: new Date().toISOString(),
      };
      
      const existing = [...savedAddresses];
      // Check for duplicates
      if (existing.some(addr => addr.address.toLowerCase() === address.toLowerCase().trim())) {
        console.log('⚠️ Duplicate address found in localStorage');
        return false;
      }
      
      const updated = [newAddress, ...existing];
      setSavedAddresses(updated);
      localStorage.setItem('savedAddresses', JSON.stringify(updated));
      console.log('✅ Saved to localStorage successfully');
      return true;
    }

    console.log('🔄 Saving to Supabase for user:', user.id);
    
    try {
      // Check for duplicates first
      console.log('🔍 Checking for existing address...');
      const { data: existing, error: checkError } = await supabase
        .from('saved_addresses')
        .select('id, address')
        .eq('address', address.trim())
        .eq('user_id', user.id);

      console.log('🔍 Duplicate check result:', { existing, checkError });

      if (checkError) {
        console.error('❌ Error checking for duplicates:', checkError);
        throw checkError;
      }

      if (existing && existing.length > 0) {
        console.log('⚠️ Duplicate address found in database:', existing);
        return false; // Already exists
      }

      console.log('📝 Inserting new address into database...');
      const insertPayload = {
        user_id: user.id,
        address: address.trim(),
        is_lmi_eligible: isLmiEligible
      };
      console.log('📝 Insert payload:', insertPayload);

      const { data: insertData, error: insertError } = await supabase
        .from('saved_addresses')
        .insert(insertPayload)
        .select('*');

      console.log('📝 Insert result:', { insertData, insertError });

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      if (!insertData || insertData.length === 0) {
        console.error('❌ No data returned from insert operation');
        throw new Error('No data returned from insert');
      }

      console.log('✅ Insert successful:', insertData);
      await fetchAddresses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('❌ Error saving address to database:', error);
      return false;
    }
  };

  const removeAddress = async (id: string): Promise<boolean> => {
    console.log('removeAddress called:', { id, hasUser: !!user });
    
    if (!user) {
      // For unauthenticated users, use localStorage
      const updated = savedAddresses.filter(addr => addr.id !== id);
      setSavedAddresses(updated);
      localStorage.setItem('savedAddresses', JSON.stringify(updated));
      console.log('Removed from localStorage');
      return true;
    }

    try {
      console.log('Removing from database...');
      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete successful');
      await fetchAddresses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing address:', error);
      return false;
    }
  };

  const refreshAddresses = async (): Promise<void> => {
    console.log('refreshAddresses called');
    await fetchAddresses();
  };

  useEffect(() => {
    console.log('useSavedAddresses useEffect triggered');
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
