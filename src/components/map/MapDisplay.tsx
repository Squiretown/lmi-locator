
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MapPin } from 'lucide-react';
import MapInitializer from './MapInitializer';
import { useMapboxToken } from '@/hooks/useMapboxToken';

interface MapDisplayProps {
  lat?: number;
  lon?: number;
  isEligible: boolean;
  tractId?: string;
  address: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, isEligible, tractId, address }) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [tractError, setTractError] = useState<string | null>(null);
  
  // Use the existing hook to get Mapbox token
  const { token: mapboxToken, isLoading, error: tokenError } = useMapboxToken();
  
  // Handle token error
  React.useEffect(() => {
    if (tokenError) {
      console.error('Error fetching Mapbox token:', tokenError);
      setMapError('Could not initialize map due to configuration issues. Please try again later.');
      toast.error('Map Error', {
        description: 'Could not initialize map due to configuration issues.'
      });
    }
  }, [tokenError]);
  
  // Display loading state while fetching token
  if (isLoading || !mapboxToken) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold tracking-wider text-foreground">LMICHECK.COM</div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
            </div>
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Display LMI branded message if no coordinates
  if (!lat || !lon) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold tracking-wider text-foreground">LMICHECK.COM</div>
            <p className="text-muted-foreground text-sm">Address coordinates not available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle map initialization errors
  const handleMapError = (error: string) => {
    console.error('Map initialization error:', error);
    setMapError(error);
    toast.error('Map Error', {
      description: error
    });
  };
  
  // Handle tract boundary loading errors
  const handleTractBoundaryError = (error: string) => {
    console.warn('Tract boundary error:', error);
    setTractError(error);
    toast('Tract Boundary Warning', {
      description: 'Could not load census tract boundary. The map will still show the property location.'
    });
  };
  
  return (
    <div className="w-full h-[400px] relative">
      {mapError ? (
        <div className="w-full h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold tracking-wider text-foreground">LMICHECK.COM</div>
              <p className="text-muted-foreground text-sm">{mapError}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <MapInitializer
            mapboxToken={mapboxToken}
            lat={lat}
            lon={lon}
            isEligible={isEligible}
            tractId={tractId}
            onMapError={handleMapError}
            onTractBoundaryError={handleTractBoundaryError}
          />
        </div>
      )}
      
      {tractError && !mapError && (
        <div className="absolute bottom-2 left-2 right-2">
          <Alert variant="default" className="bg-opacity-90 text-xs p-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {tractError}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;