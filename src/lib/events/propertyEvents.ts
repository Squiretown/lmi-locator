
import type { SavedAddress } from '@/types/saved-addresses';

/**
 * Dispatch a property saved event
 */
export function dispatchPropertySavedEvent(address: string, isLmiEligible: boolean): void {
  const customEvent = new CustomEvent('property-saved', { 
    bubbles: true,
    detail: { 
      address,
      isLmiEligible,
      timestamp: new Date().toISOString()
    } 
  });
  document.dispatchEvent(customEvent);
  console.log("Property saved event dispatched:", address);
}

/**
 * Add a listener for property saved events
 */
export function addPropertySavedListener(callback: () => void): void {
  document.addEventListener('property-saved', callback);
}

/**
 * Remove a listener for property saved events
 */
export function removePropertySavedListener(callback: () => void): void {
  document.removeEventListener('property-saved', callback);
}
