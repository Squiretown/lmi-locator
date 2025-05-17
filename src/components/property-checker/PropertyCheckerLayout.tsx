
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import PropertyResults from './PropertyResults';
import PropertyScreener from './PropertyScreener';
import { usePropertyWorkflow } from '@/hooks/usePropertyWorkflow';
import PropertySearchForm from '../property-form/PropertySearchForm';

interface PropertyCheckerLayoutProps {
  currentData: CheckLmiStatusResponse | null;
  error: string | null;
  onReset: () => void;
  onClose: () => void;
}

const PropertyCheckerLayout: React.FC<PropertyCheckerLayoutProps> = ({
  currentData,
  error,
  onReset,
  onClose
}) => {
  const { displayMode } = usePropertyWorkflow();

  return (
    <div className="w-full max-w-4xl mx-auto">
      {displayMode === 'form' && (
        <div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
        </div>
      )}

      {displayMode === 'results' && currentData && (
        <PropertyResults
          data={currentData}
          onReset={onReset}
          onClose={onClose}
        />
      )}

      {displayMode === 'screener' && currentData && (
        <PropertyScreener
          address={currentData.address || ''}
          onComplete={onClose}
        />
      )}
    </div>
  );
};

export default PropertyCheckerLayout;
