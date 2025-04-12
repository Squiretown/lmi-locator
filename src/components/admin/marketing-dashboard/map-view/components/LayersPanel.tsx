
import React from 'react';
import { Toggle } from "@/components/ui/toggle";

interface LayersPanelProps {
  useRealData: boolean;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ useRealData }) => {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div className="bg-muted p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">Map Layers</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Census Tract Boundaries</span>
            <Toggle pressed aria-label="Toggle census tracts" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">LMI Status Colors</span>
            <Toggle pressed aria-label="Toggle LMI colors" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Property Markers</span>
            <Toggle aria-label="Toggle property markers" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">County Boundaries</span>
            <Toggle aria-label="Toggle county boundaries" />
          </div>
        </div>
      </div>

      <div className="bg-muted p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2 rounded-sm"></div>
            <span className="text-sm">LMI Eligible Tract</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 mr-2 rounded-sm"></div>
            <span className="text-sm">Non-Eligible Tract</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2 rounded-sm"></div>
            <span className="text-sm">Selected Tract</span>
          </div>
        </div>
      </div>

      {useRealData && (
        <div className="bg-muted p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Data Source</h4>
          <p className="text-xs text-muted-foreground">
            Currently using real data from the census database. If no real data is available for a search, mock data will be used as a fallback.
          </p>
        </div>
      )}
      {!useRealData && (
        <div className="bg-muted p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Data Source</h4>
          <p className="text-xs text-muted-foreground">
            Currently using mock data for demonstration purposes. Click the "Mock" button at the top to switch to real data.
          </p>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
