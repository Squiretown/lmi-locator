
import React, { useState, useEffect } from 'react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapStatus from './MapStatus';
import MapInitializer from './MapInitializer';

interface MapDisplayProps {
  lat?: number;
  lon?: number;
  isEligible: boolean;
  tractId?: string;
  address?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, isEligible, tractId, address }) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [tractBoundaryError, setTractBoundaryError] = useState<string | null>(null);
  const { token: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();
  
  // Default coordinates if none provided
  const defaultLat = 40.73; // Default latitude (approximate center of US)
  const defaultLon = -73.93; // Default longitude
  
  // State for coordinates that will be determined by geocoding if needed
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number}>({ 
    lat: lat || defaultLat, 
    lon: lon || defaultLon 
  });
  const [geocodingCompleted, setGeocodingCompleted] = useState(false);

  // Update coordinates when props change
  useEffect(() => {
    if (lat && lon) {
      setCoordinates({ lat, lon });
      setGeocodingCompleted(true);
    }
  }, [lat, lon]);

  // If an address is provided but no valid coordinates, attempt to geocode the address
  useEffect(() => {
    const attemptGeocoding = async () => {
      if (address && !geocodingCompleted && (!lat || !lon)) {
        try {
          // This is a placeholder for a geocoding implementation
          // In a real application, you would call a geocoding service here
          console.log("Geocoding address:", address);
          
          // For now, we'll just use the default coordinates
          setCoordinates({ lat: defaultLat, lon: defaultLon });
          setGeocodingCompleted(true);
        } catch (error) {
          console.error("Geocoding error:", error);
          setMapError("Failed to geocode address. Using default location.");
          setCoordinates({ lat: defaultLat, lon: defaultLon });
          setGeocodingCompleted(true);
        }
      }
    };
    
    attemptGeocoding();
  }, [address, lat, lon, geocodingCompleted, defaultLat, defaultLon]);

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
          lat={coordinates.lat}
          lon={coordinates.lon}
          isEligible={isEligible}
          tractId={tractId}
          onMapError={handleMapError}
          onTractBoundaryError={handleTractBoundaryError}
        />
      ) : null}

      <MapStatus 
        isLoadingToken={isLoadingToken} 
        mapError={mapError || tractBoundaryError || tokenError} 
        lat={coordinates.lat}
        lon={coordinates.lon}
        tractId={tractId}
      />
    </div>
  );
};

export default MapDisplay;
