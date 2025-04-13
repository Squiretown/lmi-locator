
import React from 'react';
import { MapView } from '@/components/admin/marketing-dashboard/map-view';

interface MapTabContentProps {
  onExportResults: (results: any[]) => void;
}

export const MapTabContent: React.FC<MapTabContentProps> = ({ 
  onExportResults 
}) => {
  return (
    <div className="h-full">
      <MapView onExportResults={onExportResults} />
    </div>
  );
};
