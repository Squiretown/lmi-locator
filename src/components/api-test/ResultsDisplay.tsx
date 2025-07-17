
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ResultsDisplayProps {
  results: any;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  if (!results) return null;
  
  // Determine which geocoding service was used
  const geocodingService = results.geocoding_service || 
                           (results.geoid ? 'Census' : 'ESRI');
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>API Results</CardTitle>
          <div className="space-x-2">
            {/* Show QCT status if available */}
            {results.is_qct !== undefined && (
              <Badge variant={results.is_qct ? "secondary" : "outline"}>
                {results.is_qct ? "QCT" : "Non-QCT"}
              </Badge>
            )}
            
            {/* Show geocoding service */}
            {geocodingService && (
              <Badge variant={geocodingService === 'Census' ? "default" : 
                           (geocodingService === 'ESRI' ? "secondary" : "outline")}>
                {geocodingService}
              </Badge>
            )}
          </div>
        </div>
        {results.eligibility && (
          <CardDescription>
            LMI Status: <span className={results.is_approved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {results.lmi_status || results.eligibility}
            </span>
            {results.percentage_of_ami && (
              <span className="ml-2">
                ({results.percentage_of_ami}% of AMI)
              </span>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Textarea 
          value={JSON.stringify(results, null, 2)} 
          className="font-mono h-64"
          readOnly
        />
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
