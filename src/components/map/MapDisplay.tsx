
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import MapInitializer from './MapInitializer';
import { supabase } from '@/integrations/supabase/client';

interface MapDisplayProps {
  lat?: number;
  lon?: number;
  isEligible: boolean;
  tractId?: string;
  address: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, isEligible, tractId, address }) => {
  const { toast } = useToast();
  const [mapError, setMapError] = useState<string | null>(null);
  const [tractError, setTractError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  
  // Fetch the Mapbox token from Supabase
  React.useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'mapbox_token')
          .single();
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          // Fallback to use the token from Supabase secrets for edge functions
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
          
          if (tokenError) {
            throw new Error('Failed to get Mapbox token');
          }
          
          setMapboxToken(tokenData.token);
          return;
        }
        
        if (data) {
          setMapboxToken(data.value);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setMapError('Could not initialize map due to configuration issues. Please try again later.');
        toast({
          title: 'Map Error',
          description: 'Could not initialize map due to configuration issues.',
          variant: 'destructive',
        });
      }
    };
    
    fetchMapboxToken();
  }, [toast]);
  
  // Display loading state while fetching token
  if (!mapboxToken) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }
  
  // Display error message if no coordinates
  if (!lat || !lon) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Could not display map. Location coordinates not available for this address.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Handle map initialization errors
  const handleMapError = (error: string) => {
    console.error('Map initialization error:', error);
    setMapError(error);
    toast({
      title: 'Map Error',
      description: error,
      variant: 'destructive',
    });
  };
  
  // Handle tract boundary loading errors
  const handleTractBoundaryError = (error: string) => {
    console.warn('Tract boundary error:', error);
    setTractError(error);
    toast({
      title: 'Tract Boundary Warning',
      description: 'Could not load census tract boundary. The map will still show the property location.',
      variant: 'default',
    });
  };
  
  return (
    <div className="w-full h-[400px] relative">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <MapInitializer
          mapboxToken={mapboxToken}
          lat={lat}
          lon={lon}
          isEligible={isEligible}
          tractId={tractId}
          onMapError={handleMapError}
          onTractBoundaryError={handleTractBoundaryError}
        />
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
