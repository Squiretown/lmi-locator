
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ResultsDisplayProps {
  results: any;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  if (!results) return null;
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>API Results</CardTitle>
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
