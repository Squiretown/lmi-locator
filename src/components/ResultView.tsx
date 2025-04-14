
import React from 'react';
import { CheckLmiStatusResponse } from '@/lib/types';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import PropertySearchCard from './property-form/PropertySearchCard';
import ResultsSection from './property-results/ResultsSection';

interface ResultViewProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ data, onContinue, onReset }) => {
  const { isLoading, submitPropertySearch } = usePropertySearch();

  function onSubmit(values: any) {
    submitPropertySearch(values);
  }

  return (
    <div className="container relative mx-auto max-w-2xl p-4">
      <PropertySearchCard 
        onSubmit={onSubmit}
        isLoading={isLoading}
      />

      {data && (
        <ResultsSection 
          data={data}
          onContinue={onContinue}
          onReset={onReset}
        />
      )}
    </div>
  );
};

export default ResultView;
