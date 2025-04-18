
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckLmiStatusResponse, AssistanceProgram } from '@/lib/types';

// Define the display modes for property workflow
export type DisplayMode = 'form' | 'result' | 'screener' | 'programs' | 'specialist' | 'search' | 'results';

export function usePropertyWorkflow() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('form');
  const [matchingPrograms, setMatchingPrograms] = useState<AssistanceProgram[]>([]);

  // Use useCallback to memoize functions that are passed as props
  const handleEligibilityComplete = useCallback((data: any) => {
    setMatchingPrograms(data.matchingPrograms || []);
    setDisplayMode('programs');
  }, []);

  const handleConnectSpecialist = useCallback(() => {
    setDisplayMode('specialist');
  }, []);

  const handleSpecialistComplete = useCallback(() => {
    // Reset the form after specialist request is complete
    setDisplayMode('form');
    
    // Show thank you message
    toast("We appreciate your interest in down payment assistance programs.");
  }, []);

  const resetProcess = useCallback(() => {
    console.log("Resetting workflow process");
    setMatchingPrograms([]);
    setDisplayMode('form');
  }, []);

  const showResults = useCallback((lmiStatus: CheckLmiStatusResponse | null) => {
    if (lmiStatus) {
      console.log("Setting display mode to results:", lmiStatus);
      setDisplayMode('results');
    }
  }, []);

  const showScreener = useCallback(() => {
    console.log("Setting display mode to screener");
    setDisplayMode('screener');
  }, []);

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
