
import React from 'react';
import { Button } from "@/components/ui/button";
import { ResultsMap } from '@/components';
import { CheckLmiStatusResponse } from '@/lib/types';
import EligibilityIndicator from '../map/EligibilityIndicator';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  data, 
  onContinue, 
  onReset
}) => {
  const tractId = data.tract_id || 'Unknown';

  return (
    <>
      <EligibilityIndicator 
        isEligible={data.is_approved} 
        onGetMoreInfo={onContinue} 
      />
      
      <div className="mt-8">
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onReset}>
            Search Again
          </Button>
        </div>
        
        <div className="mt-4">
          <ResultsMap
            lat={34.052235}
            lon={-118.243683}
            isEligible={data.is_approved}
            tractId={tractId}
          />
        </div>
      </div>
    </>
  );
};

export default ResultsSection;
