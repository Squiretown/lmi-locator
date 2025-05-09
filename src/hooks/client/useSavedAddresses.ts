
import { useSavedAddresses as useBaseAddresses } from '@/hooks/useSavedAddresses';

/**
 * Client-specific implementation of saved addresses hook
 * This is a wrapper around the base hook to ensure consistent usage
 * across client components
 */
export function useSavedAddresses() {
  return useBaseAddresses();
}
