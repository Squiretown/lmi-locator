// File: src/components/admin/marketing-dashboard/map-view/components/SearchPanel.tsx
// Updated SearchPanel with better county handling and validation

import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  // Check if we have any search criteria
  const hasSearchCriteria = selectedState || selectedZip;
  const isCountyRequired = selectedState && !selectedZip;
  const canSearch = !loading && (selectedState || selectedZip);

  return (
    <div className="flex flex-col space-y-4 mt-4">
      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Select a <strong>State + County</strong> OR enter a <strong>ZIP Code</strong> to search census tracts.
        </AlertDescription>
      </Alert>

      {/* State Selection */}
      <div>
        <label className="text-sm text-muted-foreground">
          State {!selectedZip && <span className="text-red-500">*</span>}
        </label>
        <Select 
          value={selectedState} 
          onValueChange={(value) => {
            setSelectedState(value);
            setSelectedCounty(""); // Reset county when state changes
          }}
          disabled={loading}
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

      {/* County Selection */}
      <div>
        <label className="text-sm text-muted-foreground">
          County {isCountyRequired && <span className="text-orange-500">(Recommended)</span>}
        </label>
        <Select 
          value={selectedCounty} 
          onValueChange={setSelectedCounty}
          disabled={!selectedState || loading || countiesForState.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedState 
                ? "Select a state first" 
                : countiesForState.length === 0
                  ? "No counties available"
                  : "Select county (optional)"
            } />
          </SelectTrigger>
          <SelectContent>
            {countiesForState.map(county => (
              <SelectItem key={county.fips} value={county.fips}>
                {county.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedState && countiesForState.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground mt-1">
            No counties found. Try searching by ZIP code instead.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* ZIP Code Input */}
      <div>
        <label className="text-sm text-muted-foreground">
          ZIP Code {!selectedState && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={selectedZip}
          onChange={(e) => setSelectedZip(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter ZIP code"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use ZIP code to search without selecting state/county
        </p>
      </div>

      {/* Search Radius */}
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
          disabled={loading}
        />
      </div>

      {/* LMI Filter Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={showLmiOnly}
          onCheckedChange={setShowLmiOnly}
          id="lmi-only"
          disabled={loading}
        />
        <label htmlFor="lmi-only" className="text-sm font-medium">
          Show LMI eligible tracts only
        </label>
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        disabled={!canSearch}
        className="mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search Census Tracts
          </>
        )}
      </Button>

      {/* Validation Message */}
      {!hasSearchCriteria && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Please select a state or enter a ZIP code to search.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Display */}
      {statsData && (
        <div className="bg-muted p-3 rounded-md mt-2">
          <h4 className="text-sm font-medium mb-2">Search Results</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Tracts:</span>
              <span className="font-medium">{statsData.totalTracts}</span>
            </div>
            <div className="flex justify-between">
              <span>LMI Eligible:</span>
              <span className="font-medium text-green-600">{statsData.lmiTracts}</span>
            </div>
            <div className="flex justify-between">
              <span>LMI Percentage:</span>
              <span className="font-medium">{statsData.lmiPercentage}%</span>
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