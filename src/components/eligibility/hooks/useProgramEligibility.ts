
import { checkEligibility } from '../services/eligibilityService';

/**
 * Hook for checking program eligibility
 */
export const useProgramEligibility = () => {
  return { checkEligibility };
};
