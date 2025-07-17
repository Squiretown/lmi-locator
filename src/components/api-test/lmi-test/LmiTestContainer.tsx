
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LmiTestOptions from './LmiTestOptions';
import AddressInput from './AddressInput';
import LmiTestButton from './LmiTestButton';

interface LmiTestContainerProps {
  address: string;
  setAddress: (address: string) => void;
  searchType: 'address' | 'place';
  setSearchType: (type: 'address' | 'place') => void;
  level: 'tract' | 'blockGroup';
  setLevel: (level: 'tract' | 'blockGroup') => void;
  useHud: boolean;
  setUseHud: (useHud: boolean) => void;
  useEnhanced: boolean;
  setUseEnhanced: (useEnhanced: boolean) => void;
  useDirect: boolean;
  setUseDirect: (useDirect: boolean) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleLmiTest: () => void;
}

const LmiTestContainer: React.FC<LmiTestContainerProps> = ({
  address,
  setAddress,
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
  errorMessage,
  setErrorMessage,
  loading,
  handleLmiTest
}) => {
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
          onClick={handleLmiTest}
          loading={loading}
          disabled={!address}
        />
      </CardContent>
    </Card>
  );
};

export default LmiTestContainer;
