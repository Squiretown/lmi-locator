
import React from 'react';
import { Card } from "@/components/ui/card";

interface MapErrorProps {
  errorMessage: string;
}

const MapError: React.FC<MapErrorProps> = ({ errorMessage }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/75">
      <Card className="p-4 max-w-md text-center">
        <p className="text-destructive font-medium mb-2">{errorMessage}</p>
        <p className="text-sm text-muted-foreground">
          Please check your internet connection or Mapbox API key.
        </p>
      </Card>
    </div>
  );
};

export default MapError;
