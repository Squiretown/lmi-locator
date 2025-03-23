
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckLmiStatusResponse } from '@/lib/types';
import ResultCard from '@/components/Result';

interface ResultViewProps {
  lmiStatus: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ lmiStatus, onContinue, onReset }) => {
  return (
    <>
      <ResultCard data={lmiStatus} />
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-3">Check Down Payment Assistance Eligibility</h2>
        <p className="text-muted-foreground mb-4">
          Answer a few questions to see if you qualify for down payment assistance programs for this property.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onContinue}>
            Check Eligibility
          </Button>
          <Button variant="outline" onClick={onReset}>
            Start Over
          </Button>
        </div>
      </div>
    </>
  );
};

export default ResultView;
