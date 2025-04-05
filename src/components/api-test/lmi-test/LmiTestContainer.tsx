
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LmiTestOptions from './LmiTestOptions';
import AddressInput from './AddressInput';
import LmiTestButton from './LmiTestButton';
import { useLmiTest } from './useLmiTest';

interface LmiTestContainerProps {
  address: string;
  setAddress: (address: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LmiTestContainer: React.FC<LmiTestContainerProps> = ({
  address,
  setAddress,
  setResults,
  loading,
  setLoading
}) => {
  const {
    searchType,
    setSearchType,
    level,
    setLevel,
    useHud,
    setUseHud,
    useEnhanced,
    setUseEnhanced,
    useDirect,
    setUseDirect,
    useMock,
    setUseMock,
    errorMessage,
    setErrorMessage,
    handleLmiTest
  } = useLmiTest();

  const onTestButtonClick = () => {
    handleLmiTest(address, setResults);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Test LMI Status Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LmiTestOptions 
          searchType={searchType}
          setSearchType={setSearchType}
          level={level}
          setLevel={setLevel}
          useHudData={useHud}
          setUseHudData={setUseHud}
          useEnhanced={useEnhanced}
          setUseEnhanced={setUseEnhanced}
          useDirect={useDirect}
          setUseDirect={setUseDirect}
          useMock={useMock}
          setUseMock={setUseMock}
        />
        
        <AddressInput 
          address={address}
          setAddress={setAddress}
          searchType={searchType}
        />
        
        {errorMessage && (
          <div className="text-destructive text-sm">
            {errorMessage}
            <button 
              className="ml-2 text-xs underline"
              onClick={() => setErrorMessage('')}
            >
              Clear
            </button>
          </div>
        )}
        
        <LmiTestButton 
          onClick={onTestButtonClick}
          loading={loading}
          disabled={!address}
        />
      </CardContent>
    </Card>
  );
};

export default LmiTestContainer;
