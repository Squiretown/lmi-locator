
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CensusTract, StatsData } from '../hooks/types/census-tract';

interface SearchPanelProps {
  states: Array<{ code: string; name: string }>;
  countiesForState: Array<{ fips: string; name: string }>;
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
}

const SearchPanel: React.FC<SearchPanelProps> = ({
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
  statsData
}) => {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div>
        <label className="text-sm text-muted-foreground">State</label>
        <Select 
          value={selectedState} 
          onValueChange={(value) => {
            setSelectedState(value);
            setSelectedCounty(""); // Reset county when state changes
          }}
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
    </div>
  );
};

export default SearchPanel;
