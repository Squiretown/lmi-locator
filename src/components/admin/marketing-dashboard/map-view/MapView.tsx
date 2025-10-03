// File: src/components/admin/marketing-dashboard/map-view/MapView.tsx
// Added NY county names + Enhanced debugging for map display

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

// Florida county code to name mapping
const FLORIDA_COUNTY_NAMES: Record<string, string> = {
  '001': 'Alachua', '003': 'Baker', '005': 'Bay', '007': 'Bradford', '009': 'Brevard',
  '011': 'Broward', '013': 'Calhoun', '015': 'Charlotte', '017': 'Citrus', '019': 'Clay',
  '021': 'Collier', '023': 'Columbia', '027': 'DeSoto', '029': 'Dixie', '031': 'Duval',
  '033': 'Escambia', '035': 'Flagler', '037': 'Franklin', '039': 'Gadsden', '041': 'Gilchrist',
  '043': 'Glades', '045': 'Gulf', '047': 'Hamilton', '049': 'Hardee', '051': 'Hendry',
  '053': 'Hernando', '055': 'Highlands', '057': 'Hillsborough', '059': 'Holmes', '061': 'Indian River',
  '063': 'Jackson', '065': 'Jefferson', '067': 'Lafayette', '069': 'Lake', '071': 'Lee',
  '073': 'Leon', '075': 'Levy', '077': 'Liberty', '079': 'Madison', '081': 'Manatee',
  '083': 'Marion', '085': 'Martin', '086': 'Miami-Dade', '087': 'Monroe', '089': 'Nassau',
  '091': 'Okaloosa', '093': 'Okeechobee', '095': 'Orange', '097': 'Osceola', '099': 'Palm Beach',
  '101': 'Pasco', '103': 'Pinellas', '105': 'Polk', '107': 'Putnam', '109': 'St. Johns',
  '111': 'St. Lucie', '113': 'Santa Rosa', '115': 'Sarasota', '117': 'Seminole', '119': 'Sumter',
  '121': 'Suwannee', '123': 'Taylor', '125': 'Union', '127': 'Volusia', '129': 'Wakulla',
  '131': 'Walton', '133': 'Washington'
};

// New York county code to name mapping  
const NY_COUNTY_NAMES: Record<string, string> = {
  '001': 'Albany', '003': 'Allegany', '005': 'Bronx', '007': 'Broome', '009': 'Cattaraugus',
  '011': 'Cayuga', '013': 'Chautauqua', '015': 'Chemung', '017': 'Chenango', '019': 'Clinton',
  '021': 'Columbia', '023': 'Cortland', '025': 'Delaware', '027': 'Dutchess', '029': 'Erie',
  '031': 'Essex', '033': 'Franklin', '035': 'Fulton', '037': 'Genesee', '039': 'Greene',
  '041': 'Hamilton', '043': 'Herkimer', '045': 'Jefferson', '047': 'Kings', '049': 'Lewis',
  '051': 'Livingston', '053': 'Madison', '055': 'Monroe', '057': 'Montgomery', '059': 'Nassau',
  '061': 'New York', '063': 'Niagara', '065': 'Oneida', '067': 'Onondaga', '069': 'Ontario',
  '071': 'Orange', '073': 'Orleans', '075': 'Oswego', '077': 'Otsego', '079': 'Putnam',
  '081': 'Queens', '083': 'Rensselaer', '085': 'Richmond', '087': 'Rockland', '089': 'St. Lawrence',
  '091': 'Saratoga', '093': 'Schenectady', '095': 'Schoharie', '097': 'Schuyler', '099': 'Seneca',
  '101': 'Steuben', '103': 'Suffolk', '105': 'Sullivan', '107': 'Tioga', '109': 'Tompkins',
  '111': 'Ulster', '113': 'Warren', '115': 'Washington', '117': 'Wayne', '119': 'Westchester',
  '121': 'Wyoming', '123': 'Yates'
};

const MapView: React.FC<MapViewProps> = ({ onExportResults }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTract, setSelectedTract] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState([25]);
  const [selectedState, setSelectedState] = useState<string>("NY"); // Changed to NY for testing
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");
  const [showLmiOnly, setShowLmiOnly] = useState(false); // Changed to false to show ALL tracts
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
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  /**
   * Get readable county name from code
   */
  const getCountyName = (countyCode: string, countyName: string | null, stateCode: string): string => {
    // If we already have a readable name, use it
    if (countyName && countyName !== countyCode && countyName.length > 3) {
      return countyName;
    }

    // Use state-specific mappings
    if (stateCode === 'FL' || stateCode === '12') {
      return FLORIDA_COUNTY_NAMES[countyCode] || `County ${countyCode}`;
    }
    
    if (stateCode === 'NY' || stateCode === '36') {
      return NY_COUNTY_NAMES[countyCode] || `County ${countyCode}`;
    }

    // Fallback: show code with County suffix
    return `County ${countyCode}`;
  };

  // Load counties when state changes
  useEffect(() => {
    const fetchCounties = async () => {
      if (!selectedState) {
        setCountiesForState([]);
        return;
      }

      setLoadingCounties(true);
      setSelectedCounty("");
      console.log('🔍 Loading counties for:', selectedState);

      try {
        const { data, error } = await supabase.functions.invoke('census-db', {
          body: {
            action: 'searchBatch',
            params: { state: selectedState }
          }
        });

        if (error) {
          console.error('❌ Error loading counties:', error);
          throw error;
        }

        console.log('📊 Response data:', data);

        const countyMap = new Map<string, { fips: string; name: string }>();
        
        if (data && data.tracts && Array.isArray(data.tracts)) {
          console.log(`📋 Processing ${data.tracts.length} tracts`);
          
          data.tracts.forEach((tract: any) => {
            const countyCode = tract.county_code || tract.countyCode || tract.county;
            const countyName = tract.county || null;
            
            if (countyCode && !countyMap.has(countyCode)) {
              const displayName = getCountyName(countyCode, countyName, selectedState);
              countyMap.set(countyCode, { fips: countyCode, name: displayName });
            }
          });
        }

        const counties = Array.from(countyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('✅ Loaded counties:', counties);
        setCountiesForState(counties);

        if (counties.length === 0) {
          toast.info("No counties found", {
            description: `No county data available for ${selectedState}. Try searching by ZIP code.`
          });
        }

      } catch (error) {
        console.error('💥 Error fetching counties:', error);
        toast.error("Failed to load counties", {
          description: "Could not load county list. Try searching by ZIP code instead."
        });
        setCountiesForState([]);
      } finally {
        setLoadingCounties(false);
      }
    };

    fetchCounties();
  }, [selectedState]);

  const handleTractClick = (tract: any) => {
    setSelectedTract(tract);
  };

  const handleSearch = () => {
    if (!selectedState && !selectedZip) {
      toast.error("Search criteria required", {
        description: "Please select a state or enter a ZIP code"
      });
      return;
    }

    if (selectedState && !selectedCounty && !selectedZip) {
      toast.warning("Searching entire state", {
        description: `Searching all census tracts in ${selectedState}. This may take a moment...`
      });
    }

    console.log('🔍 SEARCH PARAMS:', {
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

  // Debug: Log when tracts change
  useEffect(() => {
    console.log('🗺️ TRACTS UPDATED:', {
      totalTracts: tracts.length,
      lmiTracts: tracts.filter(t => t.isLmiEligible).length,
      showLmiOnly,
      displayedTracts: showLmiOnly ? tracts.filter(t => t.isLmiEligible).length : tracts.length,
      sampleTract: tracts[0]
    });
    
    if (tracts.length > 0) {
      console.log('📍 First 3 tracts:', tracts.slice(0, 3));
    }
  }, [tracts, showLmiOnly]);

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
        
        {sidebarCollapsed && (
          <div className="p-4">
            <GeometryUpdatePanel />
          </div>
        )}
      </div>

      {/* Main Content */}
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