
import { LmiResult, LmiCheckOptions } from '../types';
import { checkLmiStatus } from '../core/check-lmi-status';

/**
 * Check LMI status using HUD data (convenience method)
 * @param address The address to check
 * @param options Configuration options
 * @returns Promise with the LMI status result
 */
export const checkHudLmiStatus = async (
  address: string, 
  options?: Omit<LmiCheckOptions, 'useHud'>
): Promise<LmiResult> => {
  return checkLmiStatus(address, { 
    useHud: true,
    searchType: options?.searchType || 'address',
    level: options?.level || 'tract'
  });
};

/**
 * Check LMI status by place name using HUD data
 * @param placeName The place name to check
 * @param options Configuration options
 * @returns Promise with the LMI status result 
 */
export const checkHudLmiStatusByPlace = async (
  placeName: string, 
  options?: Pick<LmiCheckOptions, 'level'>
): Promise<LmiResult> => {
  return checkLmiStatus(placeName, {
    useHud: true,
    searchType: 'place',
    level: options?.level || 'tract'
  });
};
