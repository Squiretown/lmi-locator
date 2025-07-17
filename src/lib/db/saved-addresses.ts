
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SavedAddress, SaveAddressInput } from '@/types/saved-addresses';
import { parseAddress, generateMLSNumber, getDefaultPrice } from '@/lib/utils/address-parser';

export async function fetchSavedAddresses(userId?: string): Promise<SavedAddress[]> {
  if (!userId) return [];

  try {
    // Query to get saved properties with their related property information
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

    if (error) {
      console.error('DB error fetching saved addresses:', error);
      throw error;
    }

    // Map the data to our SavedAddress type
    return data.map(item => ({
      id: item.id,
      address: item.properties?.address || 'Unknown address',
      createdAt: item.created_at,
      isLmiEligible: item.properties?.is_lmi_eligible || item.is_favorite || false,
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
    console.log(`Saving to DB - Address: ${address}, LMI: ${isLmiEligible}`);
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
      // Parse the address to extract components
      const parsedAddress = parseAddress(address);
      console.log('Parsed address:', parsedAddress);
      
      // Create a new property record with the LMI status
      const { data: newProperty, error: propertyError } = await supabase
        .from('properties')
        .insert({
          address: parsedAddress.address,
          price: getDefaultPrice(),
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip_code: parsedAddress.zipCode,
          mls_number: generateMLSNumber(),
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
    const { error } = await supabase
      .from('saved_properties')
      .insert({
        user_id: userId,
        property_id: propertyId,
        is_favorite: isLmiEligible, // Use is_favorite to store LMI status as a backup
        notes
      });
      
    if (error) {
      console.error('Error inserting saved property:', error);
      throw error;
    }
    
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
