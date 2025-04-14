
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
  // Format address to avoid undefined values
  const formatAddress = () => {
    // Use address from data if available, but ensure no undefined parts are displayed
    if (!data.address) return "Address unavailable";
    
    // Clean up the address to remove any UNDEFINED values that might be in the string
    return data.address.replace(/undefined/gi, "").replace(/,\s*,/g, ",").replace(/\s+/g, " ").trim();
  };
  
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
