
import type { SavedAddress } from '@/types/saved-addresses';

/**
 * Get saved addresses from local storage
 */
export function getSavedAddressesFromLocalStorage(): SavedAddress[] {
  try {
    const localAddresses = localStorage.getItem('savedAddresses');
    if (localAddresses) {
      const parsed = JSON.parse(localAddresses);
      console.log("Retrieved addresses from localStorage:", parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error parsing local saved addresses:', error);
    localStorage.removeItem('savedAddresses');
  }
  return [];
}

/**
 * Save address to local storage
 */
export function saveAddressToLocalStorage(
  address: string, 
  isLmiEligible: boolean = false,
  existingAddresses: SavedAddress[]
): { success: boolean, updatedAddresses: SavedAddress[], newAddress: SavedAddress } {
  try {
    const newAddress: SavedAddress = {
      id: crypto.randomUUID(),
      address,
      createdAt: new Date().toISOString(),
      isLmiEligible
    };
    const updatedAddresses = [newAddress, ...existingAddresses];
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    return { 
      success: true, 
      updatedAddresses, 
      newAddress 
    };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { 
      success: false, 
      updatedAddresses: existingAddresses, 
      newAddress: null as unknown as SavedAddress 
    };
  }
}

/**
 * Remove address from local storage
 */
export function removeAddressFromLocalStorage(
  id: string,
  existingAddresses: SavedAddress[]
): { success: boolean, updatedAddresses: SavedAddress[] } {
  try {
    const updatedAddresses = existingAddresses.filter(address => address.id !== id);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    return { success: true, updatedAddresses };
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return { success: false, updatedAddresses: existingAddresses };
  }
}
