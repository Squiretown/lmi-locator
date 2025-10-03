// File: src/components/admin/marketing-dashboard/map-view/MapView.tsx
// DEBUGGING VERSION - Add console logs to see what's happening

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import MapContainer, { MapRef } from './MapContainer';
import TractInfoPanel from './TractInfoPanel';
import MapSidebar from './components/MapSidebar';
import { GeometryUpdatePanel } from './components/GeometryUpdatePanel';
import { useTractSearch } from './hooks';
import { supabase } from '@/integrations/supabase/client';

interface MapViewProps {
  onExportResults?: (results: any[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ onExportResults }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTract, setSelectedTract] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState([25]);
  const [selectedState, setSelectedState] = useState<string>("FL");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");
  const [showLmiOnly, setShowLmiOnly] = useState(true);
  const [countiesForState, setCountiesForState] = useState<Array<{ fips: string; name: string }>>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const mapRef = useRef<MapRef>(null);
  
  const { 
    tracts, 
    loading, 
    error,
    selectedTracts,
    setSelectedTracts,
    performSearch,
    exportSelectedTracts,
    statsData
  } = useTractSearch();

  // All US states
  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  // Load counties when state changes
  useEffect(() => {
    const fetchCounties = async () => {
      console.log('🔄 fetchCounties useEffect triggered');
      console.log('📍 selectedState:', selectedState);
      
      if (!selectedState) {
        console.log('⚠️ No state selected, clearing counties');
        setCountiesForState([]);
        return;
      }

      setLoadingCounties(true);
      setSelectedCounty(""); // Reset county selection when state changes
      console.log('🔄 Loading counties for state:', selectedState);

      try {
        console.log('📡 Calling census-db function with params:', { 
          action: 'searchBatch',
          params: { state: selectedState }
        });
        
        // Call census-db to get all tracts for this state
        const { data, error } = await supabase.functions.invoke('census-db', {
          body: {
            action: 'searchBatch',
            params: { 
              state: selectedState
            }
          }
        });

        console.log('📥 census-db response received');
        console.log('❓ error:', error);
        console.log('📊 data:', data);

        if (error) {
          console.error('❌ Error from census-db:', error);
          throw error;
        }

        if (!data) {
          console.warn('⚠️ No data returned from census-db');
          throw new Error('No data returned');
        }

        console.log('✅ Data structure:', {
          hasData: !!data,
          hasTracts: !!(data && data.tracts),
          isArray: Array.isArray(data?.tracts),
          tractCount: data?.tracts?.length || 0
        });

        // Extract unique counties from the tracts
        const countyMap = new Map<string, { fips: string; name: string }>();
        
        if (data && data.tracts && Array.isArray(data.tracts)) {
          console.log('🔍 Processing', data.tracts.length, 'tracts');
          console.log('📋 Sample tract:', data.tracts[0]);
          
          data.tracts.forEach((tract: any, index: number) => {
            // Debug first few tracts
            if (index < 3) {
              console.log(`Tract ${index}:`, {
                tractId: tract.tractId,
                county: tract.county,
                county_code: tract.county_code,
                state: tract.state
              });
            }
            
            // Try multiple ways to get county info
            const countyCode = tract.county_code || tract.county || tract.countyCode;
            const countyName = tract.county || tract.county_code || 'Unknown County';
            
            if (countyCode && !countyMap.has(countyCode)) {
              console.log(`➕ Adding county: ${countyCode} - ${countyName}`);
              countyMap.set(countyCode, {
                fips: countyCode,
                name: countyName
              });
            }
          });
        } else {
          console.error('❌ Invalid data structure:', {
            data: data,
            hasTracts: !!(data && data.tracts),
            tractsType: typeof data?.tracts
          });
        }

        const counties = Array.from(countyMap.values())
          .sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('✅ Extracted counties:', counties);
        console.log('📊 County count:', counties.length);
        
        setCountiesForState(counties);

        if (counties.length === 0) {
          console.warn('⚠️ No counties found for', selectedState);
          toast.info("No counties found", {
            description: `No county data available for ${selectedState}. Try searching by ZIP code or check the database.`
          });
        } else {
          console.log('✅ Successfully loaded', counties.length, 'counties');
        }

      } catch (error) {
        console.error('💥 Error in fetchCounties:', error);
        console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack');
        
        toast.error("Failed to load counties", {
          description: error instanceof Error ? error.message : "Could not load county list. Please try another state or search by ZIP code."
        });
        setCountiesForState([]);
      } finally {
        setLoadingCounties(false);
        console.log('🏁 fetchCounties completed');
      }
    };

    fetchCounties();
  }, [selectedState]);

  const handleTractClick = (tract: any) => {
    setSelectedTract(tract);
  };

  const handleSearch = () => {
    // Validation: Require at least state OR zipCode
    if (!selectedState && !selectedZip) {
      toast.error("Search criteria required", {
        description: "Please select a state or enter a ZIP code to search"
      });
      return;
    }

    // If state is selected but no county and no ZIP, warn user
    if (selectedState && !selectedCounty && !selectedZip) {
      toast.warning("Searching entire state", {
        description: `Searching all census tracts in ${selectedState}. This may take a moment...`
      });
    }

    console.log('🔍 Performing search with:', {
      state: selectedState,
      county: selectedCounty,
      zipCode: selectedZip,
      radius: searchRadius[0]
    });

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

  console.log('🎨 Rendering MapView with:', {
    selectedState,
    countiesCount: countiesForState.length,
    loadingCounties,
    counties: countiesForState
  });

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
          loading={loading || loadingCounties}
          handleSearch={handleSearch}
          statsData={statsData}
          selectedTracts={selectedTracts}
          setSelectedTracts={setSelectedTracts}
          handleExport={handleExport}
        />
        
        {/* Geometry Update Panel - only show when collapsed */}
        {sidebarCollapsed && (
          <div className="p-4">
            <GeometryUpdatePanel />
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

        {/* Tract info panel */}
        {selectedTract && (
          <div className="absolute bottom-4 right-4 w-80">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;