
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MapStatusProps {
  isLoadingToken: boolean;
  mapError: string | null;
  lat: number;
  lon: number;
  tractId?: string;
}

const MapStatus: React.FC<MapStatusProps> = ({ 
  isLoadingToken, 
  mapError, 
  lat, 
  lon, 
  tractId 
}) => {
  if (isLoadingToken) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">Loading map...</p>
        </div>
      </div>
    );
  }
  
  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="m-4 p-4 max-w-md text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <p className="text-muted-foreground mb-2">{mapError}</p>
          <p className="text-sm text-muted-foreground">
            Coordinates: {lat.toFixed(6)}, {lon.toFixed(6)}
            {tractId && <><br />Tract ID: {tractId}</>}
          </p>
        </Card>
      </div>
    );
  }
  
  return null;
};

export default MapStatus;
