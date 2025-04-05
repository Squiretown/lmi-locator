
import { useState } from 'react';
import { checkLmiStatus } from '@/lib/api/lmi';

export function useLmiTest() {
  const [loading, setLoading] = useState(false);
  const [useHud, setUseHud] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [useDirect, setUseDirect] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [searchType, setSearchType] = useState<'address' | 'place'>('address');
  const [level, setLevel] = useState<'tract' | 'blockGroup'>('tract');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLmiTest = async (address: string, setResults: (data: any) => void) => {
    if (!address || address.trim() === '') {
      setErrorMessage('Please enter an address');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log('Using options:', { 
        useHud, 
        useEnhanced, 
        useDirect, 
        useMock,
        searchType,
        level
      });
      
      const result = await checkLmiStatus(address, {
        useHud,
        useEnhanced,
        useDirect,
        useMock,
        searchType,
        level
      });
      
      setResults(result);
    } catch (error) {
      console.error('Error checking LMI status:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setResults({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    useHud,
    setUseHud,
    useEnhanced,
    setUseEnhanced,
    useDirect,
    setUseDirect,
    useMock,
    setUseMock,
    searchType,
    setSearchType,
    level,
    setLevel,
    errorMessage,
    setErrorMessage,
    handleLmiTest
  };
}
