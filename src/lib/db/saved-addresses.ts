
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SavedAddress, SaveAddressInput } from '@/types/saved-addresses';

export async function fetchSavedAddresses(userId?: string): Promise<SavedAddress[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        id,
        notes,
        created_at,
        is_favorite,
        property_id,
        properties:property_id (
          address,
          is_lmi_eligible
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      address: item.properties?.address || 'Unknown address',
      createdAt: item.created_at,
      isLmiEligible: item.is_favorite,
      notes: item.notes
    }));
  } catch (error) {
    console.error('Error fetching saved addresses:', error);
    return [];
  }
}

export async function saveAddressToDb(
  userId: string,
  { address, isLmiEligible, notes }: SaveAddressInput
): Promise<boolean> {
  try {
    // First check if this property exists
    let propertyId: string;
    
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
          price: 0,
          city: '',
          state: '',
          zip_code: '',
          mls_number: crypto.randomUUID(),
          is_lmi_eligible: isLmiEligible
        })
        .select('id')
        .single();
        
      if (propertyError || !newProperty) {
        throw new Error('Failed to create property record');
      }
      
      propertyId = newProperty.id;
    }
    
    // Now save the reference in saved_properties
    const { error } = await supabase
      .from('saved_properties')
      .insert({
        user_id: userId,
        property_id: propertyId,
        is_favorite: isLmiEligible,
        notes
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving address:', error);
    return false;
  }
}

export async function removeAddressFromDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing address:', error);
    return false;
  }
}
