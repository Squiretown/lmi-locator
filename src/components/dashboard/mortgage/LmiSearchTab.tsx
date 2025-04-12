
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapView } from '@/components/admin/marketing-dashboard/map-view';

interface LmiSearchTabProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTab: React.FC<LmiSearchTabProps> = ({ onExportResults }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>LMI Census Tract Map</CardTitle>
        <CardDescription>
          Search for LMI-eligible properties by census tract to target your marketing efforts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-80px)]">
        <MapView onExportResults={onExportResults} />
      </CardContent>
    </Card>
  );
};
