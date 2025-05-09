
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SavedAddress } from '@/types/saved-addresses';

/**
 * Fetch saved addresses for a specific user from the database
 */
export async function fetchSavedAddresses(userId?: string): Promise<SavedAddress[]> {
  if (!userId) return [];

  try {
    console.log("API: Fetching saved addresses for user:", userId);
    
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

/**
 * Save a new property to the database
 */
export async function saveAddressToDatabase(
  userId: string,
  address: string,
  isLmiEligible: boolean = false,
  notes?: string
): Promise<{ success: boolean, id?: string }> {
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
        user_id: userId,
        property_id: propertyId,
        is_favorite: isLmiEligible, // Use is_favorite to store LMI status as a backup
        notes
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error inserting saved property:', error);
      throw error;
    }
    
    console.log("Property saved successfully with ID:", savedProperty.id);
    return { success: true, id: savedProperty.id };
  } catch (error) {
    console.error('Error saving address:', error);
    return { success: false };
  }
}

/**
 * Remove a saved address from the database
 */
export async function removeAddressFromDatabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing address from DB:', error);
    return false;
  }
}
