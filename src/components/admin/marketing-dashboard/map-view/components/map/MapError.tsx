
import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface MapErrorProps {
  errorMessage: string;
}

const MapError: React.FC<MapErrorProps> = ({ errorMessage }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm animate-in fade-in">
      <Card className="p-6 max-w-md text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">Map Error</h3>
        <p className="text-destructive/90 font-medium mb-4">{errorMessage}</p>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Please check your internet connection or Mapbox API key.</p>
          <p>If the problem persists, try refreshing the page.</p>
        </div>
      </Card>
    </div>
  );
};

export default MapError;
