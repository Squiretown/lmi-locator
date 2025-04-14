
import { useProgramEligibility } from './hooks/useProgramEligibility';

export const useProgramEligibilityCheck = () => {
  const { checkEligibility } = useProgramEligibility();
  
  return { checkEligibility };
};
