
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import MapContainer, { MapRef } from './MapContainer';
import TractInfoPanel from './TractInfoPanel';
import MapSidebar from './components/MapSidebar';
import { useTractSearch } from './hooks';

interface MapViewProps {
  onExportResults?: (results: any[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ onExportResults }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTract, setSelectedTract] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState([25]); // miles
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");
  const [showLmiOnly, setShowLmiOnly] = useState(true);
  const mapRef = useRef<MapRef>(null);
  
  const { 
    tracts, 
    loading, 
    states,
    searchResults,
    selectedTracts,
    setSelectedTracts,
    performSearch,
    exportSelectedTracts,
    statsData,
    getCountiesForState,
    useRealData,
    toggleDataSource
  } = useTractSearch();

  useEffect(() => {
    // Initialize with some defaults when component loads
    if (states.length > 0 && !selectedState) {
      setSelectedState("FL"); // Default to Florida if available
    }
  }, [states, selectedState]);

  const handleTractClick = (tract: any) => {
    setSelectedTract(tract);
  };

  const handleSearch = () => {
    performSearch({
      state: selectedState,
      county: selectedCounty,
      zipCode: selectedZip,
      radius: searchRadius[0]
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleExport = async () => {
    try {
      const exportData = await exportSelectedTracts();
      if (onExportResults) {
        onExportResults(exportData);
      }
      
      toast.success("Export successful", {
        description: `${exportData.length} tracts exported to marketing list.`
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "There was an error exporting the data. Please try again."
      });
    }
  };

  // Safely get counties for the selected state
  const countiesForState = selectedState ? getCountiesForState(selectedState) : [];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`transition-all duration-300 bg-background border-r ${
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        <MapSidebar 
          sidebarCollapsed={sidebarCollapsed}
          states={states}
          countiesForState={countiesForState}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedCounty={selectedCounty}
          setSelectedCounty={setSelectedCounty}
          selectedZip={selectedZip}
          setSelectedZip={setSelectedZip}
          searchRadius={searchRadius}
          setSearchRadius={setSearchRadius}
          showLmiOnly={showLmiOnly}
          setShowLmiOnly={setShowLmiOnly}
          loading={loading}
          handleSearch={handleSearch}
          statsData={statsData}
          selectedTracts={selectedTracts}
          setSelectedTracts={setSelectedTracts}
          handleExport={handleExport}
          useRealData={useRealData}
          toggleDataSource={toggleDataSource}
        />
      </div>

      {/* Main Content with Map and Button to toggle sidebar */}
      <div className="flex-1 relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>

        <div className="h-full">
          <MapContainer 
            tracts={showLmiOnly ? tracts.filter(t => t.isLmiEligible) : tracts}
            onTractClick={handleTractClick}
            selectedTract={selectedTract}
            selectedTracts={selectedTracts}
            onSelectTract={(tract) => {
              const exists = selectedTracts.some(t => t.tractId === tract.tractId);
              if (exists) {
                setSelectedTracts(selectedTracts.filter(t => t.tractId !== tract.tractId));
              } else {
                setSelectedTracts([...selectedTracts, tract]);
              }
            }}
            ref={mapRef}
          />
        </div>

        {/* Info Panel that appears when tract is selected */}
        {selectedTract && (
          <TractInfoPanel 
            tract={selectedTract}
            onClose={() => setSelectedTract(null)}
            isSelected={selectedTracts.some(t => t.tractId === selectedTract.tractId)}
            onToggleSelect={() => {
              const exists = selectedTracts.some(t => t.tractId === selectedTract.tractId);
              if (exists) {
                setSelectedTracts(selectedTracts.filter(t => t.tractId !== selectedTract.tractId));
              } else {
                setSelectedTracts([...selectedTracts, selectedTract]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MapView;
