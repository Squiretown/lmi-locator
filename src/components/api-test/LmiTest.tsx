
import React, { useState } from 'react';
import LmiTestContainer from './lmi-test/LmiTestContainer';

interface LmiTestProps {
  address: string;
  setAddress: (address: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LmiTest = ({
  address,
  setAddress,
  setResults,
  loading,
  setLoading
}: LmiTestProps) => {
  // State for LMI test options
  const [searchType, setSearchType] = useState<"address" | "place">("address");
  const [level, setLevel] = useState<"tract" | "blockGroup">("tract");
  const [useHud, setUseHud] = useState<boolean>(false);
  const [useEnhanced, setUseEnhanced] = useState<boolean>(false);
  const [useDirect, setUseDirect] = useState<boolean>(true);
  const [useMock, setUseMock] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle LMI test
  const handleLmiTest = async () => {
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
      
      const result = await import('@/lib/api/lmi').then(api => 
        api.checkLmiStatus(address, {
          useHud,
          useEnhanced,
          useDirect,
          useMock,
          searchType,
          level
        })
      );
      
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

  return (
    <LmiTestContainer
      address={address}
      setAddress={setAddress}
      searchType={searchType}
      setSearchType={setSearchType}
      level={level}
      setLevel={setLevel}
      useHud={useHud}
      setUseHud={setUseHud}
      useEnhanced={useEnhanced}
      setUseEnhanced={setUseEnhanced}
      useDirect={useDirect}
      setUseDirect={setUseDirect}
      useMock={useMock}
      setUseMock={setUseMock}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      setResults={setResults}
      loading={loading}
      setLoading={setLoading}
      handleLmiTest={handleLmiTest}
    />
  );
};

export default LmiTest;
