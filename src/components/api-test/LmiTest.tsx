
import React from 'react';
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
  return (
    <LmiTestContainer
      address={address}
      setAddress={setAddress}
      setResults={setResults}
      loading={loading}
      setLoading={setLoading}
    />
  );
};

export default LmiTest;
