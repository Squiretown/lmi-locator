
import React from 'react';
import { Button } from "@/components/ui/button";
import { ResultsMap } from '@/components';
import { CheckLmiStatusResponse } from '@/lib/types';
import EligibilityIndicator from '../map/EligibilityIndicator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

interface ResultsSectionProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
  onSaveProperty?: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  data, 
  onContinue, 
  onReset,
  onSaveProperty
}) => {
  // Format address to avoid undefined values
  const formatAddress = () => {
    // Use address from data if available, but ensure no undefined parts are displayed
    if (!data.address) return "Address unavailable";
    
    // Clean up the address to remove any UNDEFINED values that might be in the string
    return data.address
      .replace(/undefined/gi, "")
      .replace(/,\s*,/g, ",")
      .replace(/,\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const cleanAddress = formatAddress();
  const tractId = data.tract_id || 'Unknown';

  return (
    <>
      <EligibilityIndicator 
        isEligible={data.is_approved} 
        onGetMoreInfo={onContinue} 
      />
      
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <h3 className="font-medium text-lg">{cleanAddress}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={data.is_approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {data.is_approved ? <CheckCircle className="h-3 w-3 mr-1 inline" /> : null}
                {data.is_approved ? "LMI Eligible" : "Not Eligible"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                Checked on {new Date().toLocaleDateString()}
              </span>
            </div>
            {data.is_approved && (
              <div className="mt-2 text-sm text-green-700">
                5 Programs Available
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onSaveProperty && (
              <Button variant="outline" onClick={onSaveProperty}>
                Save Property
              </Button>
            )}
            <Button variant="outline" onClick={onReset}>
              Search Again
            </Button>
          </div>
        </div>
        
        <div className="mt-4 rounded-lg overflow-hidden border">
          <ResultsMap
            tractId={tractId}
            address={cleanAddress}
          />
        </div>
      </div>
    </>
  );
};

export default ResultsSection;
