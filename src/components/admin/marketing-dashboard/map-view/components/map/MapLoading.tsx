
import React from 'react';

const MapLoading: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm animate-in fade-in">
      <div className="flex flex-col items-center gap-2 p-4 rounded-md bg-background/90 shadow-md">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <div className="text-lg font-medium">Loading map...</div>
        <div className="text-sm text-muted-foreground">Please wait while we initialize the map</div>
      </div>
    </div>
  );
};

export default MapLoading;
