
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface LmiTestOptionsProps {
  searchType: 'address' | 'place';
  setSearchType: (value: 'address' | 'place') => void;
  level: 'tract' | 'blockGroup';
  setLevel: (value: 'tract' | 'blockGroup') => void;
  useHudData: boolean;
  setUseHudData: (value: boolean) => void;
  useEnhanced: boolean;
  setUseEnhanced: (value: boolean) => void;
  useDirect: boolean;
  setUseDirect: (value: boolean) => void;
}

const LmiTestOptions: React.FC<LmiTestOptionsProps> = ({
  searchType,
  setSearchType,
  level,
  setLevel,
  useHudData,
  setUseHudData,
  useEnhanced,
  setUseEnhanced,
  useDirect,
  setUseDirect
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-type">Search Type</Label>
        <Select 
          value={searchType} 
          onValueChange={(value: 'address' | 'place') => setSearchType(value)}
          disabled={useEnhanced || useDirect}
        >
          <SelectTrigger id="search-type">
            <SelectValue placeholder="Select search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">Search by Address</SelectItem>
            <SelectItem value="place">Search by Place Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="geography-level">Geography Level</Label>
        <Select 
          value={level} 
          onValueChange={(value: 'tract' | 'blockGroup') => setLevel(value)}
          disabled={useEnhanced || useDirect}
        >
          <SelectTrigger id="geography-level">
            <SelectValue placeholder="Select geography level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tract">Census Tract</SelectItem>
            <SelectItem value="blockGroup">Block Group</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <OptionSwitch 
        id="use-hud"
        label={`Use HUD LMI data (${useHudData ? 'Enabled' : 'Disabled'})`}
        checked={useHudData}
        onCheckedChange={(checked) => {
          setUseHudData(checked);
          if (checked) {
            setUseEnhanced(false);
            setUseDirect(false);
          }
        }}
        disabled={useEnhanced || useDirect}
      />
      
      <OptionSwitch 
        id="use-enhanced"
        label={`Use Enhanced Implementation (${useEnhanced ? 'Enabled' : 'Disabled'})`}
        checked={useEnhanced}
        onCheckedChange={(checked) => {
          setUseEnhanced(checked);
          if (checked) {
            setUseHudData(false);
            setUseDirect(false);
          }
        }}
        disabled={useHudData || useDirect}
      />
      
      <OptionSwitch 
        id="use-direct"
        label={`Use Direct ArcGIS Service (${useDirect ? 'Enabled' : 'Disabled'})`}
        checked={useDirect}
        onCheckedChange={(checked) => {
          setUseDirect(checked);
          if (checked) {
            setUseHudData(false);
            setUseEnhanced(false);
          }
        }}
        disabled={useHudData || useEnhanced}
      />

      <div className="text-xs text-muted-foreground">
        {useDirect 
          ? "Using direct ArcGIS Feature Service implementation"
          : (useEnhanced 
              ? "Using enhanced client-side implementation with direct API calls"
              : (useHudData 
                  ? "Using HUD's Low-to-Moderate Income Summary Data (LMISD)" 
                  : "Using Census American Community Survey (ACS) data"))}
      </div>
    </div>
  );
};

interface OptionSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const OptionSwitch: React.FC<OptionSwitchProps> = ({
  id,
  label,
  checked,
  onCheckedChange,
  disabled
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};

export default LmiTestOptions;
