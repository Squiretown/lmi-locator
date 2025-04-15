
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MapPin, Home, Save } from 'lucide-react';
import { CheckLmiStatusResponse } from '@/lib/types';
import ResultsMap from './map/ResultsMap';

interface ResultViewProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
  onSaveProperty?: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ data, onContinue, onReset, onSaveProperty }) => {
  // Determine if the property is eligible
  const isEligible = data.is_approved;
  
  // Clean up address to remove UNDEFINED and extra commas
  const cleanAddress = data.address
    ? data.address
        .replace(/undefined/gi, '')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : 'Address not available';
  
  return (
    <div className="space-y-6">
      <Card className={`border-l-4 ${isEligible ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEligible ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Property is LMI Eligible</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Property is Not LMI Eligible</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Property Address</p>
                <p className="text-sm text-muted-foreground">{cleanAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Home className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Census Tract</p>
                <p className="text-sm text-muted-foreground">{data.tract_id || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Income Category</p>
                <p className="text-sm text-muted-foreground">{data.income_category || 'Unknown'}</p>
              </div>
              <div>
                <p className="font-medium">Median Income</p>
                <p className="text-sm text-muted-foreground">
                  ${(data.median_income || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="font-medium">AMI Percentage</p>
                <p className="text-sm text-muted-foreground">
                  {data.percentage_of_ami || 0}%
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{data.lmi_status || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={onReset} variant="outline">Start New Search</Button>
            {onSaveProperty && (
              <Button onClick={onSaveProperty} className="gap-2">
                <Save className="h-4 w-4" />
                Save Property
              </Button>
            )}
          </div>
          {isEligible && (
            <Button onClick={onContinue}>
              Continue to Eligibility
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {data.tract_id && (
        <Card>
          <CardHeader>
            <CardTitle>Tract Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            <ResultsMap 
              tractId={data.tract_id} 
              address={cleanAddress} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultView;
