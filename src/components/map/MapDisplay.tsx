
import React, { useState } from 'react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapStatus from './MapStatus';
import MapInitializer from './MapInitializer';

interface MapDisplayProps {
  lat: number;
  lon: number;
  isEligible: boolean;
  tractId?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, isEligible, tractId }) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [tractBoundaryError, setTractBoundaryError] = useState<string | null>(null);
  const { token: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();

  // Handle map initialization errors
  const handleMapError = (error: string) => {
    setMapError(error);
  };

  // Handle tract boundary loading errors
  const handleTractBoundaryError = (error: string) => {
    setTractBoundaryError(error);
  };

  return (
    <div className="w-full h-[350px] md:h-[450px] bg-secondary/50 relative">
      {/* Show status messages or the map */}
      {!tokenError && !isLoadingToken && mapboxToken ? (
        <MapInitializer
          mapboxToken={mapboxToken}
          lat={lat}
          lon={lon}
          isEligible={isEligible}
          tractId={tractId}
          onMapError={handleMapError}
          onTractBoundaryError={handleTractBoundaryError}
        />
      ) : null}

      <MapStatus 
        isLoadingToken={isLoadingToken} 
        mapError={mapError || tractBoundaryError || tokenError} 
        lat={lat}
        lon={lon}
        tractId={tractId}
      />
    </div>
  );
};

export default MapDisplay;
