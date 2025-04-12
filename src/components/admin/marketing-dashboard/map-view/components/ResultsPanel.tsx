
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { CensusTract } from '../hooks/types/census-tract';

interface ResultsPanelProps {
  selectedTracts: CensusTract[];
  setSelectedTracts: (tracts: CensusTract[]) => void;
  handleExport: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  selectedTracts,
  setSelectedTracts,
  handleExport
}) => {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div className="bg-muted p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">Selected Tracts</h4>
        {selectedTracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tracts selected. Click on tracts on the map to select them.
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {selectedTracts.map(tract => (
              <div key={tract.tractId} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                <span className="text-sm">{tract.tractId}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedTracts(selectedTracts.filter(t => t.tractId !== tract.tractId));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleExport}
        disabled={selectedTracts.length === 0}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        Export Selected Tracts
      </Button>
    </div>
  );
};

export default ResultsPanel;
