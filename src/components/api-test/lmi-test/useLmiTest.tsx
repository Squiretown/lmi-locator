import { useState } from 'react';

// This hook is now empty as we're handling state directly in the LmiTest component
// We're just keeping the file as a placeholder for backward compatibility
export function useLmiTest() {
  console.warn('useLmiTest is deprecated. Use direct state management instead.');
  
  return {
    searchType: 'address' as const,
    setSearchType: () => {},
    level: 'tract' as const,
    setLevel: () => {},
    useHudData: false,
    setUseHudData: () => {},
    useEnhanced: false,
    setUseEnhanced: () => {},
    useDirect: true,
    setUseDirect: () => {},
    useMock: false,
    setUseMock: () => {},
    errorMessage: '',
    setErrorMessage: () => {},
    handleLmiTest: async () => {}
  };
}
