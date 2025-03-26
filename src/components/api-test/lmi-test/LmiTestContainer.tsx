
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
    useHudData,
    setUseHudData,
    useEnhanced,
    setUseEnhanced,
    useDirect,
    setUseDirect,
    useMock,
    setUseMock,
    handleLmiTest
  } = useLmiTest({
    address,
    setResults,
    setLoading
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test LMI Status Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LmiTestOptions 
          searchType={searchType}
          setSearchType={setSearchType}
          level={level}
          setLevel={setLevel}
          useHudData={useHudData}
          setUseHudData={setUseHudData}
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
        
        <LmiTestButton 
          onClick={handleLmiTest}
          loading={loading}
          disabled={!address}
        />
      </CardContent>
    </Card>
  );
};

export default LmiTestContainer;
