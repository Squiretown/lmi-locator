
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Layers, 
  MapPin, 
  List,
  Search,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import MapContainer from './MapContainer';
import TractInfoPanel from './TractInfoPanel';
import { useTractSearch } from './hooks/useTractSearch';

interface MapViewProps {
  onExportResults?: (results: any[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ onExportResults }) => {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedTract, setSelectedTract] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState([25]); // miles
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");
  const [showLmiOnly, setShowLmiOnly] = useState(true);
  const mapRef = useRef(null);
  
  const { 
    tracts, 
    loading, 
    counties, 
    states,
    searchResults,
    selectedTracts,
    setSelectedTracts,
    performSearch,
    exportSelectedTracts,
    statsData
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
      
      toast({
        title: "Export successful",
        description: `${exportData.length} tracts exported to marketing list.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Safely get counties for the selected state
  const countiesForState = selectedState && counties[selectedState] ? counties[selectedState] : [];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`transition-all duration-300 bg-background border-r ${
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        {!sidebarCollapsed && (
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">LMI Census Tract Search</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="layers">
                  <Layers className="h-4 w-4 mr-2" />
                  Layers
                </TabsTrigger>
                <TabsTrigger value="results">
                  <List className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="flex flex-col space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <Select 
                    value={selectedState} 
                    onValueChange={setSelectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">County</label>
                  <Select 
                    value={selectedCounty} 
                    onValueChange={setSelectedCounty}
                    disabled={!selectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {countiesForState.map(county => (
                        <SelectItem key={county.fips} value={county.fips}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">ZIP Code (Optional)</label>
                  <input
                    type="text"
                    value={selectedZip}
                    onChange={(e) => setSelectedZip(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Search Radius: {searchRadius[0]} miles
                  </label>
                  <Slider
                    value={searchRadius}
                    onValueChange={setSearchRadius}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showLmiOnly}
                    onCheckedChange={setShowLmiOnly}
                    id="lmi-only"
                  />
                  <label htmlFor="lmi-only" className="text-sm font-medium">
                    Show LMI eligible tracts only
                  </label>
                </div>

                <Button 
                  onClick={handleSearch}
                  disabled={loading || !selectedState}
                  className="mt-2"
                >
                  {loading ? "Searching..." : "Search Census Tracts"}
                </Button>

                {statsData && (
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <h4 className="text-sm font-medium mb-2">Search Results</h4>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Total Tracts:</span>
                        <span className="font-medium">{statsData.totalTracts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LMI Eligible:</span>
                        <span className="font-medium text-green-600">{statsData.lmiTracts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Properties:</span>
                        <span className="font-medium">{statsData.propertyCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="layers" className="flex flex-col space-y-4 mt-4">
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
              </TabsContent>

              <TabsContent value="results" className="flex flex-col space-y-4 mt-4">
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
              </TabsContent>
            </Tabs>
          </div>
        )}
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
