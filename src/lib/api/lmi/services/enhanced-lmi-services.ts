
import { LmiResult } from '../types';
import { checkLmiStatus } from '../core/check-lmi-status';

/**
 * Check LMI status using enhanced client-side implementation
 * This avoids the edge function call by using direct API calls
 * @param address The address to check
 * @returns Promise with the LMI status result
 */
export const checkEnhancedLmiStatus = async (address: string): Promise<LmiResult> => {
  return checkLmiStatus(address, { useEnhanced: true });
};
