
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Layers, List, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SearchPanel from './SearchPanel';
import LayersPanel from './LayersPanel';
import ResultsPanel from './ResultsPanel';
import { CensusTract, CountyOption, StateOption, StatsData } from '../hooks/types/census-tract';

interface MapSidebarProps {
  sidebarCollapsed: boolean;
  states: StateOption[];
  countiesForState: CountyOption[];
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  selectedZip: string;
  setSelectedZip: (zip: string) => void;
  searchRadius: number[];
  setSearchRadius: (radius: number[]) => void;
  showLmiOnly: boolean;
  setShowLmiOnly: (show: boolean) => void;
  loading: boolean;
  handleSearch: () => void;
  statsData: StatsData | null;
  selectedTracts: CensusTract[];
  setSelectedTracts: (tracts: CensusTract[]) => void;
  handleExport: () => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  sidebarCollapsed,
  states,
  countiesForState,
  selectedState,
  setSelectedState,
  selectedCounty,
  setSelectedCounty,
  selectedZip,
  setSelectedZip,
  searchRadius,
  setSearchRadius,
  showLmiOnly,
  setShowLmiOnly,
  loading,
  handleSearch,
  statsData,
  selectedTracts,
  setSelectedTracts,
  handleExport
}) => {
  const [activeTab, setActiveTab] = useState("search");

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">LMI Census Tract Search</h3>
      </div>
      
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

        <TabsContent value="search">
          <SearchPanel 
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
          />
        </TabsContent>

        <TabsContent value="layers">
          <LayersPanel />
        </TabsContent>

        <TabsContent value="results">
          <ResultsPanel 
            selectedTracts={selectedTracts}
            setSelectedTracts={setSelectedTracts}
            handleExport={handleExport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MapSidebar;
