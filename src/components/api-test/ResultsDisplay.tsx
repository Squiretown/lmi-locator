
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
                           (results.data_source?.includes('MOCK') ? 'Mock Data' : 
                           (results.geoid ? 'Census' : 'ESRI'));
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>API Results</CardTitle>
          {geocodingService && (
            <Badge variant={geocodingService === 'Census' ? 'default' : 
                           (geocodingService === 'ESRI' ? 'secondary' : 'outline')}>
              {geocodingService}
            </Badge>
          )}
        </div>
        {results.eligibility && (
          <CardDescription>
            LMI Status: <span className={results.is_approved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {results.lmi_status || results.eligibility}
            </span>
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
