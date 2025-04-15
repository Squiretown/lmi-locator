
import React from 'react';
import { Button } from "@/components/ui/button";
import { ResultsMap } from '@/components';
import { CheckLmiStatusResponse } from '@/lib/types';
import EligibilityIndicator from '../map/EligibilityIndicator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin } from 'lucide-react';

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
  const lat = data.lat !== undefined ? data.lat : undefined;
  const lon = data.lon !== undefined ? data.lon : undefined;

  console.log("Rendering ResultsSection with data:", data);

  return (
    <div className="w-full">
      <EligibilityIndicator 
        isEligible={data.is_approved} 
        onGetMoreInfo={onContinue} 
      />
      
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-start gap-2">
              <div className={`p-2 rounded-full mt-1 ${data.is_approved ? 'bg-green-100' : 'bg-red-100'}`}>
                <MapPin className={`h-4 w-4 ${data.is_approved ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="font-medium text-lg">{cleanAddress}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={data.is_approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {data.is_approved ? <CheckCircle className="h-3 w-3 mr-1 inline" /> : null}
                    {data.is_approved ? "LMI Eligible" : "Not Eligible"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Checked on {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
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
            lat={lat}
            lon={lon}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
