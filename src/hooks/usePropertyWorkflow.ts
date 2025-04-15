
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckLmiStatusResponse, AssistanceProgram } from '@/lib/types';

// Define the display modes for property workflow
export type DisplayMode = 'form' | 'result' | 'screener' | 'programs' | 'specialist' | 'search' | 'results';

export function usePropertyWorkflow() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('form');
  const [matchingPrograms, setMatchingPrograms] = useState<AssistanceProgram[]>([]);

  const handleEligibilityComplete = (data: any) => {
    setMatchingPrograms(data.matchingPrograms || []);
    setDisplayMode('programs');
  };

  const handleConnectSpecialist = () => {
    setDisplayMode('specialist');
  };

  const handleSpecialistComplete = () => {
    // Reset the form after specialist request is complete
    setDisplayMode('form');
    
    // Show thank you message
    toast("We appreciate your interest in down payment assistance programs.");
  };

  const resetProcess = () => {
    setMatchingPrograms([]);
    setDisplayMode('form');
  };

  const showResults = (lmiStatus: CheckLmiStatusResponse | null) => {
    if (lmiStatus) {
      setDisplayMode('results');
    }
  };

  const showScreener = () => {
    setDisplayMode('screener');
  };

  return {
    displayMode,
    matchingPrograms,
    handleEligibilityComplete,
    handleConnectSpecialist,
    handleSpecialistComplete,
    resetProcess,
    showResults,
    showScreener
  };
}
